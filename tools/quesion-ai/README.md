# Offline Question AI Module

This module contains AI-based question generation code that is intentionally kept
outside the Next.js app source tree.

Runtime test flows must read questions from the database only.

Generation flow:
- `creator` model generates question candidates.
- `resolver` model independently solves each candidate.
- Only candidates where resolver index equals creator-marked correct index are accepted.

Environment variables:
- `AI_API_KEY` (required)
- `AI_MODEL` (optional, creator model)

Resolver model:
- Fixed to `deepseek-reasoner` (not configurable)
