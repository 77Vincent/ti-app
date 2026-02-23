# Offline Question AI Module

This module contains AI-based question generation code that is intentionally kept
outside the Next.js app source tree.

Runtime test flows must read questions from the database only.

Generation flow:
- `creator` model generates question candidates.
- Passed candidates are persisted into `QuestionPool`.

Environment variables:
- `AI_API_KEY` (required)
- `DATABASE_URL` (required, for persisting into `QuestionPool`)
- Example file: `tools/question/.env.example`
- Runtime loads `tools/question/.env` automatically.

Fixed models (not configurable):
- Generator: `deepseek-chat`

CLI usage:
- `npm run tool:question-ai -- --subcategory english --difficulty A1`

Subcategory difficulty ladders:
- `english`: `A1`, `A2`, `B1`, `B2`, `C1`, `C2`
