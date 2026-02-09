# AGENTS.md

Repository-level instructions for human and AI contributors.

## Project Snapshot

- Name: `ti-app`
- Stage: early scaffold
- Goal: A online AI-backed instant assessment tool that supports broad subjects and subcategories such as physics, math and language learning, a bit like duolingo, but it purely focus on testing, no studying.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL on AWS RDS

## Working Rules

1. Keep changes small and explain tradeoffs clearly.
2. Do not commit secrets. Keep credentials in `.env.local`. Document ENV in the .env.example
3. Prefer `make` commands for common workflows.
4. Simplicity and unification matters, do not repeat yourself, create and use sharable helpers or assets as much as possible to reduce drift.

## Definition Of Done

1. UT is properly added or updated to ensure full coverage
2. Code compiles, UT and lint passes.
