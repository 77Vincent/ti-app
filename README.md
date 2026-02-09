# ti-app

Minimal application scaffold.

## Product Context

`ti-app` is an AI-backed instant assessment tool that supports broad subjects and subcategories, including physics, math, and language learning, etc.

The core product focus is testing and evaluation, not study content delivery. In other word, learning while testing.

The motivation is to that everybody can find testing materials easily and test immedidately with only a few survey to know their requirement and target.

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
