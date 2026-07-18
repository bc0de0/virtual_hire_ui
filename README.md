# Virtual Hire UI

A React + TypeScript frontend for the Virtual Hire platform's HR operations experience, wired directly to the live `virtual_hire` (Sift API) backend — no mock layer.

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS for layout and styling
- React Router v7 for screen navigation
- TanStack Query for data fetching/mutations against the real API
- Zustand (+ `persist`) for theme and auth-token state
- React Hook Form + Zod ready for future form flows
- Lucide React for icons

## Running it (Docker-first)

The app is built to run in Docker by default — no local Node install required.

```bash
# Hot-reload dev server (Vite), served at http://localhost:5173
npm run docker:dev        # docker compose up --build

# Production-shaped build (nginx static bundle), served at http://localhost:8080
npm run docker:prod       # docker compose -f docker-compose.prod.yml up --build
```

Both point at the backend via `API_BASE_URL` (defaults to `http://10.10.24.196:8000`, override in your shell or a `.env` next to `docker-compose.yml`). The production image reads it at **container start**, not build time (`docker/entrypoint.sh` regenerates `public/env-config.js`), so retargeting the backend is a restart, not a rebuild.

Without Docker: `npm install && npm run dev` (uses `VITE_API_BASE_URL` from `.env.local` — see `.env.example` — falling back to the same default).

**CORS note:** the backend's `CORS_ALLOWED_ORIGINS` defaults to `http://localhost:5173`. The prod compose file serves on `:8080` — add that origin on the backend if you use `docker:prod` against it directly.

## Folder structure

- `src/api` — real `fetch` client (`client.ts`) and one function per backend route (`endpoints.ts`)
- `src/components/ui` — shadcn-style primitives
- `src/components/shared` — app shell, empty-state and error-note primitives
- `src/features` — route-level feature screens: dashboard, candidates, interviews, proctoring, verdicts, settings
- `src/routes` — router configuration
- `src/types` — types mirroring the backend's live OpenAPI schema
- `src/stores` — theme and auth-token state
- `docker/` — nginx config + runtime env-config entrypoint

## API coverage

The frontend only exposes what the backend actually implements today (verified against its live `/openapi.json`, not just its docs). Where a page's underlying data has no route yet — candidate/interview lists, interview creation, proctoring sessions/events — it shows an explicit empty state naming the gap instead of mock data. See `changelog.md`'s Prompt 7 entry for the full endpoint-by-endpoint breakdown.

Authenticated routes need a bearer JWT the backend verifies but doesn't issue (no login route exists yet — it expects an external provider). Paste a token in the Settings page to exercise them.
