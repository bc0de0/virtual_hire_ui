# Virtual Hire UI

A React + TypeScript frontend scaffold for the Virtual Hire platform. The current build focuses on the HR operations experience and uses a mock API layer so the backend contract can be developed in parallel.

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS for layout and styling
- React Router v6 for screen navigation
- TanStack Query for mocked data fetching
- Zustand-ready structure for interview state and flags (not yet wired to persistence)
- Recharts-ready architecture for verdict visualizations (placeholder screens for now)
- React Hook Form + Zod for future form flows
- Lucide React for icons

## Folder structure

- src/api — typed mock API client and fixtures
- src/components/ui — shadcn-style primitives
- src/components/shared — app shell and reusable layout pieces
- src/features — route-level feature screens for dashboard, candidates, interviews, proctoring, verdicts
- src/routes — router configuration
- src/types — shared domain contracts
- src/lib — utility helpers

## Mock API swap plan

The API layer is intentionally isolated behind src/api/client.ts. To switch to a real backend later, replace the mock implementation with a request adapter that returns the same TypeScript shapes and keep the rest of the app unchanged.

## Future integration points

- Real video SDK integration for the live interview and review screens
- Authentication provider for org/user context
- Real backend endpoints for resumes, transcripts, and verdict generation
