# AGENTS.md

Repository-level instructions for human and AI contributors.

## Project Snapshot

- Name: `ti-app`
- Stage: early scaffold
- Goal: Build a reliable online AI-backed testing platform and release it as early as possible.
- Business context and workflow live in `README.md`.
- Domain terminology uses `test` for the user-facing concept.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL on AWS RDS
- `pg` for database access

## Working Rules

1. Keep changes small and explain tradeoffs clearly.
2. Do not commit secrets. Keep credentials in `.env.local`. Document env vars in `.env.example`.
3. Prefer `make` commands for common workflows.
4. Favor simplicity and unification. Avoid repeating logic; use shared helpers/assets to reduce drift.
5. Database access must stay in server-side code and go through `src/lib/db.ts` unless an architecture change is explicitly requested.
6. Never expose `DATABASE_URL` or other secrets to client-side code.
7. If requirements are ambiguous or conflicting, ask for clarification before implementing.
8. Every newly created runtime source file must have a dedicated unit test file in the same change.
9. Any changed runtime behavior must include new or updated unit tests in the same change.
10. Validate external input at system boundaries, use parameterized SQL only, and enforce auth/authz on protected operations.
11. No dead code is allowed.
12. During implementation, prefer targeted test runs for touched files/areas (for example `npm run test:staged -- <paths>`).
13. Before final handoff or merge, run full project verification (`make test`, `make lint`, `make build`) unless explicitly asked not to.

## Definition Of Done

1. Every newly created runtime source file has a dedicated unit test file.
2. Runtime behavior changes include new or updated unit tests.
3. Code compiles and `make lint` passes.
4. `make build` passes.
5. `make test` passes for final handoff/merge.
