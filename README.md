# ti-app

Minimal application scaffold.

## Context

- `AGENTS.md`

## Development

- `make install`
- `make dev`

Open `http://localhost:3000` in your browser.

## Commands

All development and deploy commands are wrapped and available in the makefile

## Pre-commit Unit Tests

- Git pre-commit hook is enabled via Husky.
- On commit, staged `src/**/*.ts(x)/js(x)` files trigger related unit tests via Vitest.
- Run manually:
  - `npm run test`
  - `npm run test:staged -- <changed-file-paths>`
