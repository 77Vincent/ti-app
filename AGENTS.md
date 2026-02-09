# AGENTS.md

Repository-level instructions for human and AI contributors.

## Project Snapshot

- Name: `ti-app`
- Stage: early scaffold
- Goal: An AI-backed instant assessment tool across subjects and subcategories (for example physics, math, and language learning). It focuses on testing, not studying.

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

## Definition Of Done

1. Tests are added or updated for changed behavior, prioritizing high-risk paths over blanket coverage targets.
2. Code compiles and `make lint` passes.
3. `make build` passes.
4. If a test suite exists for changed areas, `make test` passes.
