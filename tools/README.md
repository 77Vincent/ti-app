# Offline Question AI Module

This module contains AI-based question generation code that is intentionally kept
outside the Next.js app source tree.

Runtime test flows must read questions from the database only.

Flow:
- Generator model creates question payloads and writes them into `QuestionRaw`.
- Resolver model consumes one `QuestionRaw` row at a time, predicts the correct option index, and validates:
  - predicted correct option index must be `0`
- If validation passes, the row is inserted into `QuestionCandidate`.
- Analyzer model consumes one `QuestionCandidate` row at a time and quality-checks the question.
- If analyzer passes, the row is inserted into `QuestionPool`.

Environment variables:
- `AI_API_KEY` (required)
- `DATABASE_URL` (required, for persisting into `QuestionRaw`)
- Example file: `tools/.env.example`
- Runtime loads `tools/.env` automatically.

Fixed models (not configurable):
- Generator: `deepseek-chat`
- Resolver: `deepseek-reasoner`
- Analyzer: `deepseek-reasoner`

CLI usage:
- `npm run tool:question-generate -- --subcategory english --difficulty A1`
- `npm run tool:question-resolve` (processes `QuestionRaw` rows until empty)
- `npm run tool:question-analyze` (processes `QuestionCandidate` rows until empty)

Subcategory difficulty ladders:
- `english`: `A1`, `A2`, `B1`, `B2`, `C1`, `C2`
- `chinese`: `HSK1`, `HSK2`, `HSK3`, `HSK4`, `HSK5`, `HSK6`
- `japanese`: `N5`, `N4`, `N3`, `N2`, `N1`
- `probability` (`GAISE II`): `A`, `B`, `C`
