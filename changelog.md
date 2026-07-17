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
