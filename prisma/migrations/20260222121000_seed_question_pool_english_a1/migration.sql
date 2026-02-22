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
    'Mina is new at her school. She wants to join the music club, but she is nervous to speak in front of others. Her friend says, "Do not worry. You can start small." The next day, Mina decides to ___ and introduce herself to one classmate.',
    'A1',
    '[
      {"text":"take a deep breath","explanation":"Best fit for the context and correct after decides to."},
      {"text":"takes a deep breathe","explanation":"Wrong verb form and spelling for this sentence."},
      {"text":"taking a deep breath","explanation":"Wrong form after decides to in this structure."},
      {"text":"took a deep breath yesterday","explanation":"Past-time phrase does not fit the current action in context."}
    ]'::jsonb,
    '[0]'::jsonb,
    CURRENT_TIMESTAMP
);
