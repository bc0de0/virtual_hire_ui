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
