-- SeedData
INSERT INTO "QuestionPool" (
    "id",
    "subjectId",
    "subcategoryId",
    "slot",
    "prompt",
    "difficulty",
    "options",
    "correctOptionIndexes",
    "updatedAt"
) VALUES (
    'q_language_english_a1_001',
    'language',
    'english',
    1,
    'Choose the correct sentence.',
    'A1',
    '[
      {"text":"She go to school every day.","explanation":"Incorrect verb form: use goes with she."},
      {"text":"She is go to school every day.","explanation":"Incorrect auxiliary + base verb construction."},
      {"text":"She goes to school every day.","explanation":"Correct present simple sentence."},
      {"text":"She going to school every day.","explanation":"Missing auxiliary verb for present continuous."}
    ]'::jsonb,
    '[2]'::jsonb,
    CURRENT_TIMESTAMP
);
