# Changelog

Tracks what actually changed in response to each prompt in [prompt.md](prompt.md).

---

## 2026-07-16 — Prompt 1: Fix build & dev server

- Fixed several phantom/invalid dependency versions in `package.json` that don't exist on the npm registry or don't support React 19: `@radix-ui/react-select`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-scroll-area`, `@radix-ui/react-slot`, `zustand`.
- Ran a clean `npm install` (previous `node_modules` was stale/incomplete).
- Fixed real TypeScript errors surfaced once modules resolved: unused parameter in `src/api/client.ts`, unused imports in `dashboard-page.tsx` / `interview-review-page.tsx` / `live-interview-page.tsx`, and an invalid `variant` prop passed to `Button` in `app-shell.tsx` (the component never defined a `variant` prop).
- Verified `npm run build`, `npm run dev`, and `npm run lint` all succeed; confirmed all six routes render correctly via headless-browser screenshots with zero console errors.

## 2026-07-17 — Prompt 2: Fix npm PATH, CSS/component loading

- Added `C:\Program Files\nodejs` to the persistent User `PATH` environment variable so `npm`/`node` resolve in new terminal sessions without manual prefixing.
- Root-caused the unstyled UI: `@tailwindcss/vite` was installed but never registered as a Vite plugin in `vite.config.ts`, so `@import 'tailwindcss'` in `src/index.css` was resolving to the raw, uncompiled Tailwind source instead of generated utility classes. Added the plugin.
- Confirmed the "mocked components" request was already satisfied — every page already reads from `src/api/fixtures.ts` via the mock `request()` client in `src/api/client.ts`. Verified all pages render their mock data correctly via screenshots.

## 2026-07-17 — Prompt 3: Light/dark theme toggle

- Added `src/stores/theme-store.ts`: a Zustand store with `persist` middleware, storing the theme in `localStorage` under `vh-theme`, defaulting to the OS `prefers-color-scheme` on first visit.
- Added an inline script in `index.html` `<head>` that applies the correct theme class before React hydrates, preventing a flash of the wrong theme.
- Registered Tailwind v4's class-based dark variant (`@custom-variant dark (&:where(.dark, .dark *))`) in `src/index.css` and added light-mode base colors alongside the existing dark ones.
- Added a sun/moon toggle button (`lucide-react`) to the header in `app-shell.tsx`, wired to the theme store.
- Added light-mode Tailwind class pairs throughout every component and page (`button`, `card`, `app-shell`, dashboard, upload, schedule, live, review, verdict, settings placeholder), including status/severity badge accent colors.
- Fixed a smart-quote JSX syntax bug accidentally introduced into `verdict-report-page.tsx` while editing.
- Verified `npm run build` and `npm run lint` pass, and visually confirmed both themes across all routes with zero console errors, including toggle + reload persistence.

## 2026-07-17 — Prompt 4: Repo setup & first push

- Initialized the git repository (`git init`, default branch `main`).
- Added `prompt.md` and `changelog.md` to the repo root.
- Added remote `origin` pointing to `https://github.com/bc0de0/virtual_hire_ui.git`.
- Pushed the initial commit to `main`.

## 2026-07-17 — Prompt 5: Align frontend to the virtual_hire backend contract

- Investigated `bc0de0/virtual_hire` (local checkout at `Projects/bc0de0/virtual_hire`) and found it's a **schema/docs-only scaffold** — the only implemented route is `/health`; no models, schemas, auth, CORS, or WebSocket support exist in code. The full domain model is precisely specified in its `docs/05-data-model.md` and `EPIC.md`, though unimplemented.
- Asked the user how to proceed given no live API exists; they chose to align the frontend's types/mocks to the documented spec so the shape is a drop-in match once the backend ships real endpoints.
- Rewrote `src/types/index.ts` to mirror the backend's Postgres schema field-for-field (snake_case field names, matching the wire format FastAPI/Pydantic v2 will emit with no camelCase aliasing configured): `Candidate`, `Resume`, `JobRequisition`, `Application`, `Interview`, `Transcript`, `ProctoringSession`, `ProctoringEvent`, `Verdict`, plus every documented status/enum value.
- Rewrote `src/api/fixtures.ts` with mock data matching the new types and realistic enum values.
- Reworked every page to consume the real vocabulary instead of invented fields:
  - **Dashboard** — application status badges (`submitted`/`screening`/`interviewing`/`offer`/`hired`/`rejected`/`withdrawn`) and `verdict_label` (`pass`/`review`/`fail`) replace the old fabricated `stage` and numeric `score` fields that don't exist on the backend.
  - **Upload** — resume ingestion status (`uploaded`/`parsing`/`parsed`/`parse_failed`, with `parse_error` shown on failure) replaces a static "Ready" badge.
  - **Schedule** — video conference details now come from `ProctoringSession` (`platform` + `external_meeting_ref`), since `Interview` itself carries no link/channel field on the backend; interviews without a session show "not yet configured."
  - **Proctoring** (renamed from "Live" — see below) — shows session status, the two-party consent gate (`candidate_consented_at`/`interviewer_consented_at`), and detected signals using the real `event_type` enum (`multiple_faces_detected`, `gaze_away`, `background_voice_detected`, etc.), replacing invented event types like `tab-switch` that have no backend equivalent.
  - **Review** — transcript renders from a single ingested text blob with `status`/`source`, matching the backend's `Transcript` model, instead of a fabricated array of speaker/timestamp segments the schema doesn't support.
  - **Verdict** — shows `verdict_label`, `narrative`, `stale`, and the raw `deterministic_score` JSONB key/value pairs, replacing an invented `recommendation`/`confidence`/`strengths`/`gaps`/`citations` shape with no backend counterpart.
- **Flagged and corrected a product-level mismatch**: the "Live Interview" page's real-time monitoring framing directly contradicts the backend's invariant I15 ("proctoring analysis is always asynchronous and advisory... never intervenes in a live interview session"). Renamed the nav entry to "Proctoring" and rewrote the page to reflect async, post-hoc, consent-gated analysis instead of an in-call recording view.
- Also dropped `interview.status = 'In Progress'` (not a valid backend enum value — only `scheduled`/`completed`/`cancelled`/`no_show` exist) and made the header's "N interviews scheduled" pill derive from real fixture data instead of a hardcoded "12 interviews today."
- Fixed a bug caught during verification: a formatting heuristic in the verdict page guessed any number ≤1 was a percentage, incorrectly rendering an integer count (`requirement_gaps: 1`) as "100%". Since the backend docs explicitly leave `deterministic_score`'s JSONB shape unfixed, removed the guess and render values as-is.
- Verified `npm run build` and `npm run lint` pass, and visually confirmed every route in both themes via headless-browser screenshots with zero console errors.

## 2026-07-18 — Prompt 6: Testing plan (`TESTING.md`)

- Investigated the sibling `virtual_hire` backend checkout's own `TESTING.md` (60KB, already reserves §3.1/§3.3/§7.6 for "once a frontend exists") and its actual implemented routes (`hr_users`, `organizations`, `requisitions`, `resumes`, `transcripts`, `verdicts`), so this plan fills those reservations instead of duplicating or contradicting them.
- Read every page/component/store in `src/` to ground the plan in real code, not generic boilerplate — surfaced concrete, previously-unflagged gaps along the way: the sidebar collapse toggle has no `aria-label` (blocks reliable role-based queries and accessibility scans), `CandidateUploadPage`'s "Upload resume" button only flips local `useState` with no real mutation wired up, and `index.html`'s pre-hydration theme script has an untested corrupted-`localStorage` fallback path.
- Added `TESTING.md` to the repo root: scope, testing philosophy (notably *why* both Playwright and Selenium are used deliberately rather than picking one — Playwright as the primary CT/E2E engine, Selenium as an independent headless smoke tier on the P0 critical path only), the full tool matrix (Vitest for unit, Playwright Component Testing on Chromium, Playwright E2E across Chromium/Firefox/WebKit, Selenium WebDriver headless smoke, `@axe-core/playwright` for accessibility), a browser/runtime matrix, a coverage map tying every route/component to its test layer, a ~50-case test catalog with concrete IDs, a tooling/config/npm-script appendix for implementation, and a CI job design (§12) meant to be lifted directly into the `ci.yml` this doc is a prerequisite for.
- Explicitly scoped backend testing as out-of-scope-here (owned by `virtual_hire/TESTING.md`), while defining a `[PLANNED]` backend-integration E2E tier (§7.8) and a contract/schema-drift guard (§7.6) for once the backend's own route-level test gap closes and a real OpenAPI surface exists to diff against.

## 2026-07-18 — Prompt 7: Docker-first + wire the real API, remove all mocks

- Deleted `scratch/` (the throwaway Playwright validation output from Prompt 6's testing-plan research) and the now-stale `.gitignore` entries that referenced it.
- **Pulled the live backend's actual OpenAPI schema** from `http://10.10.24.196:8000/openapi.json` rather than trusting the aspirational data model in `virtual_hire/docs/05-data-model.md` (which Prompt 5 had aligned to). The two disagree substantially: the running API only implements `organizations`, `hr-users`, `requisitions`, `applications` (submit resume), `interviews/{id}/transcript` (ingest only, no GET), `applications/{id}/verdicts/{service_type}`, and `/health` — there is no list-candidates, list-interviews, create-interview, proctoring, or list-requisitions route, and `VerdictRead` never includes a `deterministic_score` field. Also found the backend has no login/token endpoint at all — every write and most reads require a bearer JWT it expects to already exist (Auth0/Clerk), not one it issues.
- Asked the user how to handle both gaps rather than guessing: they chose (1) a dev-only bearer-token input for auth, and (2) wiring every page to real endpoints where they exist and showing honest "not available from the API yet" empty states everywhere else, instead of quietly keeping fixture data around.
- Rewrote `src/types/index.ts` to mirror the live `/openapi.json` schema exactly (dropped `Candidate`, `Resume`, `Interview`, `ProctoringSession`, `ProctoringEvent` — no routes back them; added `OrganizationRead`, `HRUserRead`, `JobRequisitionRead`, `ApplicationRead`, `TranscriptRead`, `VerdictRead` matching the real response shapes).
- Deleted `src/api/fixtures.ts` and the mock `delay()`/`mockApi` layer in `src/api/client.ts`. Replaced `client.ts` with a real `fetch` wrapper (`apiFetch`, `ApiError`, FastAPI `detail` error-message extraction, runtime API-base-URL resolution) and added `src/api/endpoints.ts` — one function per live route, grouped by resource.
- Added `src/stores/auth-store.ts` (persisted bearer token) and a Settings page (`src/features/settings/settings-page.tsx`) to manage it, check `/health`, and create/read Organizations (the only unauthenticated routes).
- Reworked every feature page around what the API actually supports:
  - **Dashboard** — real `/health` status card; candidate-pipeline and interview-schedule cards replaced with explicit empty states naming the missing endpoint.
  - **Upload** — now creates a real Requisition (`POST /requisitions`) and submits a real Application (`POST /applications`, multipart), showing actual server responses accumulated for the session (no list-applications endpoint exists to reload them from).
  - **Schedule** and **Proctoring** — both have zero backing endpoints (no interview-creation route exists at all; proctoring sessions/events aren't implemented despite being documented) — replaced the mocked slot-picker/consent UI with empty-state explainers.
  - **Review → Transcript** — reworked into a transcript-ingestion form (`POST /interviews/{id}/transcript`, text or audio file) showing the real ingestion response, since there's no GET to review a transcript afterward.
  - **Verdict** — reworked into an application-id + service-type lookup (`GET /applications/{id}/verdicts/{service_type}`); removed the deterministic-score panel since `VerdictRead` never exposes it, replaced with a note on why.
  - **app-shell** — dropped the fixture-derived "N interviews scheduled" pill for a real `/health`-driven connection indicator, and the "Mock backend ready" sidebar blurb for a real bearer-token-set indicator.
- Added `src/components/ui/{input,textarea,label,select}.tsx` and `src/components/shared/{empty-state,error-note}.tsx` — small primitives the real forms and empty states needed that didn't exist yet.
- **Dockerized the app** as the primary workflow: multi-stage `Dockerfile` (`dev` target running Vite with hot reload, `build`/`runtime` targets producing an nginx-served static bundle); `docker-compose.yml` (default, hot-reload dev — `npm run docker:dev`) and `docker-compose.prod.yml` (nginx build — `npm run docker:prod`); `docker/nginx.conf` (SPA fallback routing) and `docker/entrypoint.sh`, which regenerates `public/env-config.js` from the container's `API_BASE_URL` env var at startup so the backend target is a deploy-time choice, not a rebuild. Added `.dockerignore`, `.env.example`, and `src/types/global.d.ts` for the `window.__APP_CONFIG__` runtime-config type.
- Verified `npm run build`, `npm run lint`, and a full headless-browser pass across all seven routes on the default dev port (5173, which matches the backend's default `CORS_ALLOWED_ORIGINS`) — zero console errors, and the Settings page's "Check API health" button confirmed a real, successful round trip to the live backend.
