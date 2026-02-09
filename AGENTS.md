# AGENTS.md

Repository-level instructions for human and AI contributors.

## Project Snapshot

- Name: `ti-app`
- Stage: early scaffold
- Goal: build a Next.js web app backed by AWS RDS PostgreSQL

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL on AWS RDS
- `pg` via `src/lib/db.ts`

## Working Rules

1. Keep changes small and explain tradeoffs clearly.
2. Do not commit secrets. Keep credentials in `.env.local`.
3. Treat `DATABASE_URL` as server-only and never expose it to client code.
4. Route all DB access through `src/lib/db.ts` unless intentionally changing architecture.
5. Prefer `make` commands for common workflows.
6. Update this file when project conventions change.

## Definition Of Done

1. Code compiles and lint passes.
2. Behavior changes are documented in repo docs (`AGENTS.md` and/or `README.md`).
