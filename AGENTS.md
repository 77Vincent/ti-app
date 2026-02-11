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

## Working Rules

1. Keep changes small and explain tradeoffs clearly.
2. Do not commit secrets. Keep credentials in `.env.local`. Document env vars in `.env.example`.
3. Prefer `make` commands for common workflows.
4. Favor simplicity and unification. Avoid repeating logic; use shared helpers/assets to reduce drift.
5. Keep integration code that uses secrets in server-side code only.
6. Never expose API keys or other secrets to client-side code.
7. If requirements are ambiguous or conflicting, ask for clarification before implementing.
8. Validate external input at system boundaries and enforce auth/authz on protected operations.
9. No dead code is allowed.
10. Before final handoff or merge, run full project verification (`make lint`, `make build`) unless explicitly asked not to.

## Definition Of Done

1. Code compiles and `make lint` passes.
2. `make build` passes.
