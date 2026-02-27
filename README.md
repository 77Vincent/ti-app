# ti-app

Minimal application scaffold.

## Product Context

`ti-app` is an AI-backed instant test tool that supports broad subjects and subcategories, including physics, math, and language learning, etc.

The core product focus is testing and evaluation, not study content delivery. In other word, learning while testing.

The motivation is to that everybody can find testing materials easily and test immedidately with only a few survey to know their requirement and target.

## Workflow Spec v0: Take Test

1. Session setup
Flow: Learner selects subject and subcategory.
Rule: Test starts immediately after subcategory is selected.
Check: System can start a session with only these two selections.

2. Question generation
Flow: System starts the test session and generates the first question.
Rule: Every question is AI-generated under guided and supervised system constraints.
Check: Session never serves a non-AI-generated question.

3. Question execution
Flow: While learner answers the current question, system generates the next question in background for smoother UX.
Rule: Background generation is active only while test status is `in progress`.
Check: During an active session, next-question generation runs before current question is finalized.

4. Question type constraints
Flow: Learner receives generated questions and submits answers.
Rule: Question type is only `multiple choice` (single selection).
Check: Any unsupported question type is rejected and not shown.

5. Session ending logic
Flow: Test continues until an end condition is reached.
Rule: End condition is manual quit (`click quit`, `close tab`, `close app`).
Check: Session remains active until the user quits.

6. Status lifecycle
Flow: Session transitions from start to finish.
Rule: Test status has only two values: `in progress` and `completed`.
Check: Any manual quit action always transitions test status to `completed`.

7. Summary and metric
Flow: After completion, system shows test summary.
Rule: Result metric is accuracy (`correct rate`) only; there is no separate score.
Check: Every completed test generates summary and includes only accuracy as performance metric.

## Context

- `AGENTS.md`

## Development

- `make install`
- `make dev`

Open `http://localhost:3000` in your browser.

## Commands

All development and deploy commands are wrapped and available in the makefile

## Mobile Wrapper (Capacitor)

This project is wired for Capacitor in hosted-web mode.
The native app loads your deployed web app URL.

1. Set `CAPACITOR_SERVER_URL` in your environment (`https://...` in production).
2. Create native projects once:
   - `make cap-add-ios`
   - `make cap-add-android`
3. Sync after config/plugin changes:
   - `make cap-sync`
4. Open native IDE projects:
   - `make cap-open-ios`
   - `make cap-open-android`

## Pre-commit Unit Tests

- Git pre-commit hook is enabled via Husky.
- On commit, staged `src/**/*.ts(x)/js(x)` files trigger related unit tests via Vitest.
- Run manually:
  - `npm run test`
  - `npm run test:staged -- <changed-file-paths>`
