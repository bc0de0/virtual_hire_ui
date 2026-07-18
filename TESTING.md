# Testing Plan

**Purpose:** The single source of truth for how the Virtual Hire UI is tested — strategy, tooling, environments, and the concrete test-case catalog. This doc is the driver: new test work starts here (add/update a test-case row, then implement it), not written up after the fact. It is also the direct prerequisite for `.github/workflows/ci.yml` — every job in §12 is meant to be lifted almost verbatim into that file once this plan is agreed.

**Depends on:** [README.md](README.md) (stack, folder structure, the "Mock API swap plan"), [src/types/index.ts](src/types/index.ts) and [src/api/fixtures.ts](src/api/fixtures.ts) (the typed contract every test is written against), and the backend's own [virtual_hire/TESTING.md](../virtual_hire/TESTING.md) (this repo's sibling checkout at `Projects/bc0de0/virtual_hire`) — that document already reserves §3.1/§3.3/§7.6 for "once a frontend exists." This plan is written to fill those reservations, not duplicate or contradict them.

---

## 1. Scope

### 1.1 In scope

| Area | Detail |
|---|---|
| Routed pages | Dashboard, Candidate upload, Interview schedule, Proctoring (live interview), Interview review, Verdict report, Settings (placeholder) — everything under `src/features/` and the inline placeholder in `src/routes/index.tsx` |
| App shell | Sidebar navigation + collapse/expand, header, theme toggle, "N interviews scheduled" live-derived pill — `src/components/shared/app-shell.tsx` |
| Theme system | Light/dark toggle, `localStorage` persistence, OS `prefers-color-scheme` fallback, pre-hydration flash-of-wrong-theme guard in `index.html` — `src/stores/theme-store.ts` |
| UI primitives | `Button`, `Card`, `Badge` (`src/components/ui/`) — the only primitives actually built today; `@radix-ui/react-{avatar,dialog,dropdown-menu,scroll-area,select,tabs}` are installed but unused, so out of scope until a feature actually consumes one (§13) |
| Mock API layer & contract | `src/api/client.ts`'s `request()` wrapper, `src/api/fixtures.ts`, and the drift risk between `src/types/index.ts` and the backend's documented schema (`virtual_hire/docs/05-data-model.md`) |
| Component testing | Playwright Component Testing (`@playwright/experimental-ct-react`), Chromium-first | 
| End-to-end testing | Playwright Test, full routed app, Chromium/Firefox/WebKit | 
| Cross-engine headless smoke | Selenium WebDriver, headless Chrome (+Firefox), P0 critical path only — see §2 for why this exists alongside Playwright rather than instead of it |
| Accessibility | Automated `axe-core` scans layered onto E2E specs | 
| Backend integration (future) | A non-blocking tier that points the same specs at a real `virtual_hire` backend instead of the mock layer, once that backend has real routes for these resources (§7.8) |

### 1.2 Out of scope

| Area | Why |
|---|---|
| Backend testing (FastAPI routes, Celery workers, Postgres/Qdrant, RAG pipeline) | Owned entirely by [virtual_hire/TESTING.md](../virtual_hire/TESTING.md) — not duplicated here |
| Real video SDK integration | Not built — `interview-schedule-page.tsx` and `interview-review-page.tsx` both render explicit stub/placeholder UI ("Stub player", "not yet configured") |
| Real authentication / org context | Not built — no login flow exists anywhere in `src/routes/index.tsx` |
| Load/performance testing of this app | A thin client rendering fixture-sized lists; no case exists today where frontend render performance is a known risk. Revisit if bundle size or list virtualization becomes a real concern — not a placeholder line item for its own sake |
| Real Safari verification | `[PLANNED — P2]`, mirrors the backend plan's own framing — only pursued via a cloud device farm if a Safari-specific bug is suspected, not part of routine CI, given this is desktop-first B2B HR tooling |
| Mobile viewports | Backend's `docs/00-ideation.md` frames this as a desktop-first recruiter/HR workflow (same assumption the backend plan cites for its own out-of-scope call) — no mobile layout exists to test |
| Formal WCAG audit | Automated `axe-core` scans are in scope (§7.6); a full manual WCAG audit is `[PLANNED — not yet scoped]`, not silently assumed covered by the automated scan |
| Localization/i18n | v1 is English-only, same assumption (A5/A7) the backend plan cites |
| Visual regression baselines | `[PLANNED]` — Playwright's `toHaveScreenshot` is available and noted in §3.1, but no baseline images exist yet; do not claim visual-diff coverage until baselines are committed |

## 2. Testing philosophy

- **Test what a user (or the accessibility tree) can observe, not implementation details.** Query by role/label/text (Testing Library's and Playwright's shared philosophy) — reach for `data-testid` only where no accessible name exists (§4 lists the specific gaps that currently force this).
- **Two real-browser engines, deliberately, not redundantly.** Playwright is the primary, fast engine for component and E2E work — auto-waiting, one API across Chromium/Firefox/WebKit, ships its own browser binaries. **Selenium WebDriver runs a second, independent engine, headless, against the P0 critical path only** — cheap insurance against an engine-specific rendering or JS-execution quirk that a Playwright-only suite would never catch, and it keeps the option open to point the exact same suite at a Selenium Grid or a cloud device farm later without re-authoring tests. This directly answers (rather than overrides) the backend plan's own §3.1 note, which recommends Playwright as default but calls Selenium "a reasonable choice if the team already has Selenium Grid infrastructure or needs a browser Playwright doesn't support" — here, both engines are used on purpose, each doing the job it's best at, not because one wasn't good enough.
- **Mock-first, contract-locked.** `src/api/fixtures.ts` and `src/types/index.ts` are already hand-aligned field-for-field to the backend's documented schema (per README's "Mock API swap plan" and the repo's own `changelog.md` Prompt 5 entry). Every test in this plan is written against that contract, so swapping `src/api/client.ts`'s `request()` from mock to a real `fetch()` later should not require rewriting test assertions — only which *environment* variable points the app at (§3.3). §7.7 is the guard that keeps this assumption honest over time instead of by convention alone.
- **Determinism over flakiness.** No arbitrary `sleep`/`setTimeout` waits in specs. Playwright's auto-waiting and RTL's `findBy*`/`waitFor` queries are required; the one deliberate async delay in the app itself (`API_DELAY_MS = 400` in `src/api/client.ts:7`) is asserted *around* (wait for the loading state to resolve) never raced against with a fixed timer.
- **Theme correctness is proven in a real browser, not guessed at.** The flash-of-wrong-theme guard, the `prefers-color-scheme` fallback, `localStorage` persistence, and Tailwind's class-based `dark` variant can only be meaningfully verified by an engine that runs real CSS/DOM layout — a concrete reason component/E2E coverage carries more weight here than in a typical CRUD-form frontend.
- **CI gates on the mock backend only, today.** Every required check in this plan runs against the app's existing mock API layer; nothing in the required gate depends on the `virtual_hire` backend being up. A separate, explicitly non-blocking integration tier exists for once backend routes are real (§7.8, §6).

## 3. Test types, tooling & environments

### 3.1 Test type → tooling matrix

| Type | Tooling | Status | Runs |
|---|---|---|---|
| Type check | `tsc -b` (already `npm run build`'s first step) | Built | Every commit (local), every PR/push (CI) |
| Lint | `oxlint` (`.oxlintrc.json`) | Built | Every commit (local), every PR/push (CI) |
| Unit | `Vitest` + `@testing-library/react` + `jsdom` | **Gap — to be built** | Every commit (local), every PR/push (CI) |
| Component | **Playwright Component Testing** (`@playwright/experimental-ct-react`), real Chromium (Firefox/WebKit optional, §3.4) | **Gap — to be built** | Every PR/push (CI, Chromium); full engine set locally/nightly |
| End-to-end | **Playwright Test**, full routed app via `vite preview`, Chromium required, Firefox/WebKit nightly | **Gap — to be built** | Chromium: every PR/push (CI); full matrix: nightly/scheduled |
| Cross-engine headless smoke | **Selenium WebDriver** (`selenium-webdriver` npm package) driving headless Chrome, run under Vitest (see note below) | **Gap — to be built** | Headless Chrome: every PR/push (CI, required); headless Firefox: nightly/optional |
| Accessibility | `@axe-core/playwright`, injected into E2E specs | **Gap — to be built** | Every PR/push (CI) |
| Visual regression | Playwright's `toHaveScreenshot` | `[PLANNED]` — no baseline images committed yet | N/A until baselines exist |
| Contract/schema drift | A small script diffing `src/types/index.ts` against the backend's OpenAPI schema | `[PLANNED — gated on backend routes]`, manual review in the interim (§7.7) | Manual today; automated once backend routes emit a real `openapi.json` |
| Backend-integration E2E | Playwright, same specs as §7.5, pointed at a real `virtual_hire` (docker-compose) backend via `VITE_API_BASE_URL` | `[PLANNED — gated on backend FUNC-* tests landing]` | Non-blocking, manual/scheduled once viable |

**Why Selenium runs under Vitest, not Mocha.** Selenium doesn't ship its own test runner or assertion library — it needs one paired with it. Rather than adding a third runner (Playwright Test for CT/E2E, Vitest for unit, Mocha for Selenium), the Selenium specs run as plain async Vitest tests (`vitest.selenium.config.ts`, Node environment, no `jsdom`) that import `selenium-webdriver` directly and drive a real headless browser process. This keeps the toolchain to two runners instead of three, with no loss of capability.

**Note on browser binaries:** Playwright manages its own Chromium/Firefox/WebKit downloads (`npx playwright install`) — no separate driver-version matching. Selenium's headless Chrome path uses `chromedriver` (npm-managed, version-pinned to the CI runner's Chrome build); this is the one place this stack has to think about driver/browser version matching, which is precisely the tradeoff the backend plan's §3.1 note flags — accepted here deliberately, for the reasons in §2.

### 3.2 Test environments

| Environment | What's running | Used for |
|---|---|---|
| **Local, no server** | Just Vitest + jsdom | Unit tests only |
| **Local, dev/preview server** (`npm run build && npm run preview`, or `npm run dev`) | The app served against the mock API (`src/api/fixtures.ts`) | Component tests, E2E, Selenium smoke — the default and only environment CI needs |
| **Local, + backend docker-compose** (`virtual_hire`'s `docker compose up`) | Above + a real FastAPI backend at `localhost:8000` | Backend-integration E2E (§7.8), once viable — opt-in via `VITE_API_BASE_URL` |
| **CI** (`.github/workflows/ci.yml`, once added) | Ubuntu runner, `npx playwright install --with-deps chromium` (+ firefox/webkit on the nightly job), `chromedriver` for Selenium | Every PR/push to `main` — the release gate (§12) |
| **Selenium Grid / cloud device farm** | `[PLANNED]` | Real Safari or other engines Playwright can't reach, only if a browser-specific bug is suspected — same P2 posture the backend plan takes on real Safari |

### 3.3 Testability prerequisites

A handful of small source changes make the app reliably targetable by role/label queries instead of brittle CSS/text selectors. These should land alongside (not necessarily before) the first specs that need them — flagged here so they aren't rediscovered mid-implementation:

1. **Icon-only buttons have no accessible name.** The sidebar collapse/expand toggle (`app-shell.tsx:40`) renders only a `PanelLeftClose`/`PanelLeftOpen` icon with no `aria-label` — unlike the theme toggle two lines below it, which already has `aria-label="Toggle theme"`. Add one so both `getByRole('button', { name: /collapse|expand/i })` and `axe-core` can find it.
2. **Repeated list rows are keyed by DB id only, not exposed to the DOM.** Candidate rows (`dashboard-page.tsx`, `candidate-upload-page.tsx`), interview rows (`interview-schedule-page.tsx`), and proctoring event rows (`live-interview-page.tsx`) are `.map()`ed with React `key`s that never reach the rendered markup. Specs that need "the row for candidate X" (not just "the first row") should add a `data-testid={`candidate-row-${candidate.id}`}` (or scope by the candidate's rendered name text, which is usually sufficient and avoids adding test-only attributes where text already disambiguates).
3. **The mock API's fixed 400ms latency (`API_DELAY_MS`, `src/api/client.ts:7`) has no override.** Fine for E2E/Selenium (Playwright/Selenium both wait properly), but slows down a large component-test suite unnecessarily. Consider reading it from an env var (`import.meta.env.VITE_MOCK_API_DELAY_MS ?? 400`) so CT specs can run with it at `0`.

None of these are behavior bugs — they're deferred until now because nothing needed them before this plan.

### 3.4 Browser & runtime environment matrix

Promotes the backend plan's `[PLANNED — no frontend yet]` §3.3 table to real, active coverage now that a frontend exists.

| Target | Priority | Playwright (CT/E2E) | Selenium | Notes |
|---|---|---|---|---|
| Chromium (latest stable) | P0 | Required, every PR (CT + E2E) | Required, every PR (headless smoke) | Covers Chrome + Edge for practical purposes; the one target both engines exercise |
| Firefox (latest stable) | P1 | E2E only, nightly/optional | Headless smoke, nightly/optional | Not run on CT — component tests don't need per-engine CSS-quirk coverage the way full-page E2E does |
| WebKit (Playwright's Safari proxy) | P1 | E2E only, nightly/optional | N/A — no Selenium WebKit driver exists | Close to Safari, not identical |
| Real Safari (macOS) | P2 | `[PLANNED]` — cloud device farm only | `[PLANNED]` — same | Only pursued if a Safari-specific bug is suspected/reported |
| Screen sizes | P1 | 1920×1080 and 1366×768 | Same | Desktop-first per the backend docs' own framing (§1.2); sidebar collapse/expand is explicitly exercised at both |
| Color scheme | P0 | Light **and** dark for every spec that touches themed UI | N/A (Selenium tier is smoke-only, light mode default is enough) | This app's most distinctive frontend-only behavior surface — under-testing it defeats the point of this plan |
| Mobile viewports | Out of scope | — | — | No mobile layout exists (§1.2) |

## 4. How to read a test case

Same compact format the backend plan uses, for consistency across both repos: **ID | one-line Given→Then description | file/location (or "—" if not built) | priority**.

**Priority key:** **P0** = must pass to merge · **P1** = should pass, flag if skipped · **P2** = nice-to-have.
**Status key:** ✅ built and passing · ⚠️ built with a known gap · ❌ not built · `[PLANNED]` intentionally deferred.

## 5. Coverage map — feature → test files

| Area | Source | Unit | Component | E2E | Selenium |
|---|---|---|---|---|---|
| App shell (nav, collapse, header pill) | `src/components/shared/app-shell.tsx` | — | ✅ target | ✅ target | ✅ target (smoke) |
| Theme system | `src/stores/theme-store.ts`, `index.html` | ✅ target | ✅ target | ✅ target | — |
| Dashboard | `src/features/dashboard/dashboard-page.tsx` | — | ✅ target | ✅ target | ✅ target (smoke) |
| Candidate upload | `src/features/candidates/candidate-upload-page.tsx` | — | ✅ target | ✅ target | — |
| Interview schedule | `src/features/interviews/interview-schedule-page.tsx` | — | ✅ target | ✅ target | — |
| Proctoring (live interview) | `src/features/interviews/live-interview-page.tsx` | — | ✅ target | ✅ target | — |
| Interview review | `src/features/interviews/interview-review-page.tsx` | — | ✅ target | ✅ target | — |
| Verdict report | `src/features/verdicts/verdict-report-page.tsx` | — | ✅ target | ✅ target | — |
| Settings (placeholder) | `src/routes/index.tsx` (inline) | — | — | ✅ target (smoke only, nothing interactive) | — |
| UI primitives (Button/Card/Badge) | `src/components/ui/*.tsx` | ✅ target | ✅ target | — (covered indirectly via pages) | — |
| Mock API + fixtures + contract | `src/api/client.ts`, `src/api/fixtures.ts`, `src/types/index.ts` | ✅ target | — | — | — |
| Routing (all 7 routes resolve) | `src/routes/index.tsx`, `src/App.tsx` | — | — | ✅ target | ✅ target (smoke) |

## 6. Where this leaves things today

Nothing in this plan is built yet — `package.json` has no test runner, no `test` script, and no `tests/` directory exists. This document is the starting point, not a status report on an existing suite. The immediate next steps, in order, are: (1) agree this plan, (2) scaffold the tooling in §11's appendix, (3) write the P0 rows in §7 first, (4) add `.github/workflows/ci.yml` wired to §12. Until step 4 lands, there is no CI gate on this repo at all — every current guarantee (`npm run build`, `npm run lint` passing) is manual, per the pattern already visible in `changelog.md`'s prompt-by-prompt "Verified `npm run build`..." notes.

---

## 7. Test case catalog

### 7.1 Unit tests — `[Gap — to be built]`

Fakes/mocks pattern to follow: fake `localStorage` and `window.matchMedia` for the theme store, no network mocking needed anywhere (the "backend" is already local fixture data).

| ID | Case | Priority |
|---|---|---|
| UT-001 | `useThemeStore`'s initial `theme` matches `getSystemTheme()` when no persisted value exists | P0 |
| UT-002 | `toggleTheme()` flips `dark`↔`light` and calls `applyTheme` (asserted via `document.documentElement.classList`) | P0 |
| UT-003 | `setTheme('dark')` / `setTheme('light')` set state and DOM class directly, independent of current state | P1 |
| UT-004 | Persisted `vh-theme` in `localStorage` rehydrates to the stored theme, not the system default, on store creation | P0 |
| UT-005 | `cn()` (`src/lib/utils.ts`) merges/dedupes conflicting Tailwind classes as `tailwind-merge` promises (e.g. last `bg-*` wins) | P1 |
| UT-006 | `request()` (`src/api/client.ts`) resolves with the `fn()` return value after the mock delay, and rejects if `fn()` rejects | P1 |
| UT-007 | `Button` forwards `ref`, spreads arbitrary props (`disabled`, `onClick`, `type`), and renders as a `Slot` (no wrapper element) when `asChild` | P1 |
| UT-008 | `Badge`/`Card` render children and merge a passed `className` without dropping the base classes | P2 |
| UT-009 | Every fixture in `src/api/fixtures.ts` satisfies its declared type from `src/types/index.ts` at compile time (a `satisfies`-based type-only check, not a runtime assertion — catches fixture/type drift for free via `tsc`) | P1 |

### 7.2 Component tests (Playwright CT, Chromium) — `[Gap — to be built]`

Mounts real components in a real browser without booting the whole router — the layer that actually exercises Tailwind CSS, Radix's `Slot`, and theme classes the way jsdom-based unit tests structurally cannot.

| ID | Case | Priority |
|---|---|---|
| CT-001 | `<Button>` renders with the default light-mode classes; wrapping in a `.dark` ancestor (mirroring `index.html`'s class-toggle approach) swaps to dark-mode classes | P0 |
| CT-002 | `<Button disabled>` is not clickable (`toBeDisabled`) and shows the `disabled:opacity-50` styling | P1 |
| CT-003 | `<Badge className="...">` merges custom classes visibly (computed style check, not just class-string presence) | P2 |
| CT-004 | `AppShell`'s sidebar toggle button collapses/expands the nav (width class flips, labels hide/show) — **depends on §3.3 item 1** | P0 |
| CT-005 | `AppShell`'s theme toggle flips the icon (`Sun`↔`Moon`) and the root `.dark` class in the mounted tree | P0 |
| CT-006 | `AppShell`'s "N interviews scheduled" pill reflects the count of `status === 'scheduled'` rows from `interviews` fixtures exactly | P0 |
| CT-007 | `DashboardPage`'s three summary cards show the correct derived counts: scheduled interviews, candidates with `latest_verdict_label === null`, total pipeline size | P0 |
| CT-008 | `DashboardPage` renders every `ApplicationStatus` and `VerdictLabel` badge variant with its mapped color class (parametrized over all enum values in `src/types/index.ts`, so a new enum value with no mapped class fails loudly instead of silently falling through) | P1 |
| CT-009 | `CandidateUploadPage`: clicking "Upload resume" shows the "queued" banner (`LoaderCircle` + accepted-for-parsing text) | P0 |
| CT-010 | `CandidateUploadPage`: a candidate with `resume.status === 'parse_failed'` renders its `parse_error` text; every other status does not render an error line | P1 |
| CT-011 | `CandidateUploadPage`: renders every `ResumeStatus` badge variant (parametrized, same rationale as CT-008) | P1 |
| CT-012 | `InterviewSchedulePage`: an interview with no matching `ProctoringSession` shows "Video platform not yet configured"; one with a session shows `platform` + `external_meeting_ref` | P0 |
| CT-013 | `LiveInterviewPage`: the async-only disclaimer banner is always present regardless of session status (I15 — proctoring never intervenes live, product-level UI check) | P0 |
| CT-014 | `LiveInterviewPage`: consent rows show a filled check icon when `*_consented_at` is set, a dashed circle otherwise, independently for candidate vs. interviewer | P0 |
| CT-015 | `LiveInterviewPage`: renders every `ProctoringEventType` and `ProctoringSeverity` combination with correct label/color (parametrized) | P1 |
| CT-016 | `InterviewReviewPage`: transcript with `text: null` (or empty) shows "No transcript text available yet."; non-empty text splits into paragraph blocks on `\n\n` | P0 |
| CT-017 | `VerdictReportPage`: renders `verdict_label`, `narrative`, and every `deterministic_score` key/value pair from the fixture, formatted via `formatScoreKey`/`formatScoreValue` (booleans render as "Yes"/"No", everything else as-is — **never a bare guessed percentage**, per the code comment documenting a prior bug fix) | P0 |
| CT-018 | `VerdictReportPage`: the "stale" badge renders only when `verdict.stale === true` | P1 |
| CT-019 | Every page component renders with zero console errors/warnings when mounted with valid fixture data (a blanket smoke assertion, cheap to add per spec via Playwright CT's console-message listener) | P1 |

### 7.3 End-to-end tests (Playwright, full app) — `[Gap — to be built]`

Run against `vite preview` (production build) as the default; `vite dev` acceptable for fast local iteration. Every P0 case runs in both light and dark mode (§3.4) unless noted otherwise.

| ID | Case | Priority |
|---|---|---|
| E2E-001 | All 7 routes (`/`, `/candidates/upload`, `/interviews/schedule`, `/interviews/live`, `/interviews/review`, `/verdicts/report`, `/settings`) load with no console errors and the expected page heading/title visible | P0 |
| E2E-002 | Sidebar navigation: clicking each nav item routes correctly and marks that item visually active (`isActive` class) | P0 |
| E2E-003 | Sidebar collapse persists across a client-side route change (state lives in `AppShell`, not reset by `<Outlet>` swaps) but does **not** persist across a full page reload (confirms it's local `useState`, not persisted — document actual behavior, don't assume) | P1 |
| E2E-004 | Theme toggle flips the whole app's rendered colors, and **persists across a full page reload** via `localStorage` (`vh-theme`) | P0 |
| E2E-005 | On first visit (`localStorage` cleared), the app's initial theme matches the emulated `prefers-color-scheme` (test both `light` and `dark` via Playwright's `colorScheme` context option) | P0 |
| E2E-006 | With `vh-theme` set to a corrupted, non-JSON value in `localStorage` before load, the app still renders (dark theme, per `index.html`'s `catch` fallback) instead of a blank/crashed page | P1 |
| E2E-007 | No flash of the wrong theme: with `vh-theme` persisted as `light`, the `<html>` element does **not** carry the `dark` class at any point before or after hydration (assert immediately on `domcontentloaded`, before React mounts) | P1 |
| E2E-008 | Dashboard → clicking through to each linked/derived piece of data (candidate names, interview times) renders consistently with the same fixture data shown elsewhere (e.g. the same candidate's status matches between Dashboard and Candidate upload) | P1 |
| E2E-009 | Candidate upload: "Upload resume" → banner appears → banner text is stable (no duplicate/flicker) if clicked again | P1 |
| E2E-010 | Verdict report: narrative text and every deterministic-score row are visible without scrolling truncation at both P0 screen sizes (1920×1080, 1366×768) | P1 |
| E2E-011 | Full keyboard navigation: `Tab` through the sidebar and reach every nav item, activate one with `Enter`, without a mouse (baseline keyboard-accessibility smoke, complements §7.6's automated axe scan) | P1 |
| E2E-F01 *(mirrors backend TESTING.md §7.6 `E2E-F01`)* | Once org-scoped data exists, confirm the UI only ever renders the current org's requisitions/candidates — `[PLANNED, gated on real auth/org context existing (§1.2)]` | `[PLANNED]` |
| E2E-F02 *(mirrors backend `E2E-F02`)* | Resume status updates from `uploaded`→`parsed`→`embedded` without a manual refresh, or the plan documents that it currently requires one — `[PLANNED, gated on a real upload mutation existing — today's "Upload resume" button only sets local UI state, §3.3]` | `[PLANNED]` |
| E2E-F03 *(mirrors backend `E2E-F03`)* | A Resume Analyzer verdict never displays a bare numeric score anywhere in the UI | ✅ **buildable today** — `VerdictReportPage` already only ever renders `verdict_label` (`pass`/`review`/`fail`) + narrative + labeled key/value pairs, never a blended number; this is the one `E2E-F0x` case that doesn't need to wait on the backend |

### 7.4 Cross-engine headless smoke (Selenium WebDriver) — `[Gap — to be built]`

Deliberately thin — the P0 critical path only, headless Chrome required in CI, headless Firefox nightly/optional (§3.4). This is **not** a second copy of §7.3; it exists to catch an engine-specific blind spot cheaply, not to duplicate coverage.

| ID | Case | Priority |
|---|---|---|
| SEL-001 | App boots headless, `/` renders the Dashboard heading and all 3 summary cards | P0 |
| SEL-002 | Each of the 7 routes loads (via direct navigation, not just client-side routing) and returns a 200-equivalent render with no thrown JS error captured from the browser log | P0 |
| SEL-003 | Sidebar navigation click-through reaches every route (same assertions as E2E-002, headless-engine version) | P0 |
| SEL-004 | Theme toggle flips and persists across a reload (headless-engine version of E2E-004) | P0 |
| SEL-005 | Candidate upload's "Upload resume" button produces the queued-state banner | P1 |

### 7.5 Accessibility tests (`@axe-core/playwright`) — `[Gap — to be built]`

Layered onto the E2E specs rather than a separate page-load-only pass, so interactive states (collapsed sidebar, dark mode, post-upload banner) get scanned too, not just each page's resting state.

| ID | Case | Priority |
|---|---|---|
| A11Y-001 | Every route, light mode, resting state → zero axe violations of `critical`/`serious` impact | P0 |
| A11Y-002 | Every route, dark mode, resting state → same | P0 |
| A11Y-003 | Sidebar collapsed state → same (icon-only nav items must still have accessible names — direct consumer of §3.3 item 1) | P0 |
| A11Y-004 | Candidate upload's post-click "queued" banner → same (loading/status content should be announced, check for a live region or acceptable alternative) | P1 |
| A11Y-005 | `moderate`/`minor` axe findings are logged but non-blocking — tracked as a running list in this doc's §13, not a merge blocker, so the gate doesn't become noisy enough to get ignored | P2 |

### 7.6 Contract / schema-drift guard — `[PLANNED — gated on backend routes]`

| ID | Case | Priority | Status |
|---|---|---|---|
| CONTRACT-001 | `src/types/index.ts`'s interfaces have no field absent from / extra to the backend's live `openapi.json` schema, once backend routes emit one with real `response_model`s | P0 | `[PLANNED]` — backend's own TESTING.md §7.2 (functional/route tests) is itself still a gap, so there's no live OpenAPI surface to diff against yet |
| CONTRACT-002 (interim) | Manual: whenever `virtual_hire/docs/05-data-model.md` or `virtual_hire/app/schemas/` changes, review `src/types/index.ts` in the same work session | P1 | Process control, not an automated test — the honest interim state |

### 7.7 Manual smoke checklist

Run before merging any change that touches routing, the theme system, or the mock API contract — mirrors the spirit (not the infra) of the backend plan's §7.4.

| ID | Step | Expected result |
|---|---|---|
| SMOKE-001 | `npm run build` | Completes with zero TypeScript errors |
| SMOKE-002 | `npm run lint` | `oxlint` clean |
| SMOKE-003 | `npm run preview`, visit `/` | Dashboard renders, no console errors |
| SMOKE-004 | Click through all 7 nav items | Every route renders, active nav item highlights correctly |
| SMOKE-005 | Toggle theme, reload | Theme persists, no flash of wrong theme |

### 7.8 Backend-integrated E2E — `[PLANNED — gated on backend readiness]`

Not buildable yet: the backend repo's own README describes it as "pre-v1, in progress" and its `TESTING.md` §7.2 marks route-level functional tests as a gap. Once backend routes for `candidates`/`resumes`/`applications`/`interviews`/`transcripts`/`verdicts` exist with real request/response shapes:

1. Add a `VITE_API_BASE_URL` env var and a real `fetch()`-based implementation behind `src/api/client.ts`'s `request()` — the README's own "Mock API swap plan" already describes exactly this seam.
2. Re-run §7.3's E2E-001–011 suite unmodified against `docker compose up` (the `virtual_hire` repo's full stack) instead of the mock layer, as a separate, **non-blocking**, scheduled CI job — same "don't gate every PR on a slower, less deterministic tier" posture the backend plan itself takes on its own E2E script (§7.6) and load tests (§7.7).
3. Build out E2E-F01/F02 for real once auth/org-context and a real upload mutation exist (both currently blocked, see their rows in §7.3).

## 8. Seed / fixture data governance

Unlike the backend, this app has no real-PII risk surface today — everything renders from `src/api/fixtures.ts`, which is already synthetic. The one rule worth stating explicitly: **if `src/api/fixtures.ts` is ever seeded from real exported data for local debugging, that data does not get committed** — same hard boundary the backend plan states for its own golden dataset (its §8.1), extended here for consistency even though this repo has never had real data in it.

## 9. Logging & test evidence

- Playwright's own trace viewer (`--trace on-first-retry`) is the primary debugging artifact for CT/E2E failures — richer than screenshots alone (DOM snapshots, network, console).
- Selenium smoke failures capture the browser's console log (`driver.manage().logs().get('browser')`) on failure, since there's no built-in trace equivalent.
- CI uploads `playwright-report/` and any Selenium failure screenshots as build artifacts (`actions/upload-artifact`) so a failure is debuggable without a local re-run.

## 10. Defect / findings management

This repo doesn't currently reference an issue tracker anywhere (no `CONTRIBUTING.md`, no tracker mentioned in `README.md`/`prompt.md`). The backend repo already uses Jira project `VHIRE`. **Recommendation, to confirm with the team rather than assume:** file frontend-found defects in the same `VHIRE` project with a `frontend` label, so cross-repo defects (e.g. a UI bug that's actually a backend contract mismatch) aren't split across two systems. Until that's confirmed, track defects the way this repo already tracks everything else — a `changelog.md` entry describing what broke and what fixed it.

## 11. Tooling appendix — what to add when implementing this plan

Not applied yet; listed here so implementation is a checklist, not a re-derivation.

**New `devDependencies`:**
```
vitest, jsdom, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event,
@playwright/test, @playwright/experimental-ct-react,
@axe-core/playwright,
selenium-webdriver, chromedriver, @types/selenium-webdriver
```

**New config files:**
- `vitest.config.ts` — unit tests, `jsdom` environment
- `vitest.selenium.config.ts` — Selenium smoke, Node environment, longer per-test timeout, no parallelism (one browser instance at a time)
- `playwright-ct.config.ts` — component tests, Chromium project required, Firefox/WebKit projects marked optional
- `playwright.config.ts` — E2E, `webServer` block auto-starting `vite preview`, projects for chromium/firefox/webkit

**New `package.json` scripts:**
```
"typecheck": "tsc -b --noEmit"
"test:unit": "vitest run --config vitest.config.ts"
"test:ct": "playwright test -c playwright-ct.config.ts"
"test:e2e": "playwright test -c playwright.config.ts"
"test:e2e:all-browsers": "playwright test -c playwright.config.ts --project=chromium --project=firefox --project=webkit"
"test:selenium": "vitest run --config vitest.selenium.config.ts"
"test": "npm run test:unit && npm run test:ct && npm run test:e2e && npm run test:selenium"
```

**New directory structure:**
```
tests/
  unit/            (Vitest + RTL — §7.1)
  component/       (Playwright CT — §7.2, .ct.tsx files)
  e2e/             (Playwright Test — §7.3, .spec.ts files)
  selenium/        (Vitest + selenium-webdriver — §7.4)
  a11y/            (axe scans, or folded into tests/e2e/ — §7.5)
```

## 12. CI/CD gating (design for `.github/workflows/ci.yml`)

**Today:** no CI exists. This section is what the next step (adding `ci.yml`) should implement.

**Required job, every PR to `main` and every push to `main`:**
1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run test:unit`
5. `npx playwright install --with-deps chromium`
6. `npm run test:ct -- --project=chromium`
7. `npm run build` (needed as the artifact `vite preview` serves in the next steps)
8. `npm run test:e2e -- --project=chromium` (against `vite preview`, started via Playwright's `webServer` config)
9. `npm run test:e2e -- --grep @a11y` (or a dedicated axe job — §7.5's specs)
10. Install `chromedriver`, run `npm run test:selenium` (headless Chrome, §7.4's P0 rows)
11. Upload `playwright-report/` as a build artifact, `if: always()`

**Nightly/scheduled job (not required per-PR):**
- Full Playwright E2E matrix (Chromium + Firefox + WebKit) — `npm run test:e2e:all-browsers`
- Headless Firefox Selenium smoke
- Once backend readiness allows (§7.8): backend-integrated E2E against `docker compose up`

**Recommended additions, in priority order, once the above is green:**
1. **Visual regression baselines** (§3.1) — commit `toHaveScreenshot` baselines once the UI stabilizes past active scaffold-churn (adding them now, while pages are still being reshaped per `changelog.md`'s prompt history, would just mean constant baseline updates).
2. **Contract/schema-drift check (§7.6)** — the moment the backend emits a real OpenAPI schema.
3. **Coverage reporting** (`vitest --coverage`) surfaced in PRs — same "premature until there's enough tested surface for the number to mean something" caveat the backend plan applies to its own coverage rollout.

---

## 13. Known gaps — testing roadmap

In priority order:

1. **Nothing is built yet.** This entire plan is a from-zero scaffold — §11/§12 are the literal next actions, not aspirational.
2. **Testability prerequisites (§3.3)** — the missing `aria-label` on the sidebar toggle blocks both CT-004 and A11Y-003 from being written cleanly; fix alongside those specs, not as a separate cleanup pass.
3. **E2E-F02 (§7.3) is blocked on a real upload mutation.** `CandidateUploadPage`'s "Upload resume" button only flips local `useState` today (`candidate-upload-page.tsx:36,51`) — there is no mutation, optimistic or otherwise, wired to `src/api/client.ts`. Worth flagging to product/eng as a real scaffold gap this testing pass surfaced, independent of writing tests for it.
4. **E2E-F01 is blocked on auth/org-context not existing at all** (§1.2) — no test can meaningfully assert "only this org's data is visible" when every session sees the same unscoped fixture data.
5. **Contract/schema-drift automation (§7.6)** is blocked on the backend's own §7.2 gap (route-level tests / real OpenAPI surface) — tracked here so it isn't forgotten once that backend gap closes.
6. **Visual regression** has zero baselines — explicitly deferred, not silently assumed covered by CT/E2E's functional assertions.
7. **Real Safari, Selenium Grid/device-farm access** — `[PLANNED — P2]`, no infra provisioned, same posture the backend plan takes on its own live-vendor/staging tiers.
8. **Defect tracker for this repo is unconfirmed** (§10) — resolve with the team before relying on the `VHIRE`-project recommendation.
