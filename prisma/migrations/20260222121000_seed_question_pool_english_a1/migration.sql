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
    'The kitchen is too ___, so Anna opens the window.',
    'A1',
    '[
      {"text":"hot","explanation":"Correct: the window is opened to cool a room that is too hot."},
      {"text":"quiet","explanation":"Quiet describes sound, not temperature."},
      {"text":"slow","explanation":"Slow describes speed, not room conditions."},
      {"text":"sweet","explanation":"Sweet describes taste, not air temperature."}
    ]'::jsonb,
    '[0]'::jsonb,
    CURRENT_TIMESTAMP
), (
    'q_language_english_a2_001',
    'language',
    'english',
    2,
    'After the movie ended, Lisa checked the bus schedule and hurried home to avoid being ___ for dinner.',
    'A2',
    '[
      {"text":"early","explanation":"Opposite meaning; she is rushing to avoid being late."},
      {"text":"late","explanation":"Correct: the sentence directly expresses arriving after the expected time."},
      {"text":"hungry","explanation":"Possible feeling, but not what ''avoid being ___'' refers to here."},
      {"text":"quiet","explanation":"Not meaningful in the context of punctuality."}
    ]'::jsonb,
    '[1]'::jsonb,
    CURRENT_TIMESTAMP
), (
    'q_language_english_b1_001',
    'language',
    'english',
    3,
    'Nora revised her notes every evening, so she felt ___ before the exam.',
    'B1',
    '[
      {"text":"nervous","explanation":"Possible emotion before exams, but it conflicts with regular revision context."},
      {"text":"confused","explanation":"Would suggest poor understanding, not expected after steady revision."},
      {"text":"prepared","explanation":"Correct: consistent revision leads to feeling ready."},
      {"text":"absent","explanation":"Describes not being present, not exam readiness."}
    ]'::jsonb,
    '[2]'::jsonb,
    CURRENT_TIMESTAMP
), (
    'q_language_english_b2_001',
    'language',
    'english',
    4,
    'Investors rejected the business plan because its cost assumptions were not ___ enough.',
    'B2',
    '[
      {"text":"creative","explanation":"Creativity can help ideas, but does not validate financial assumptions."},
      {"text":"optional","explanation":"Optional does not describe whether assumptions match reality."},
      {"text":"convenient","explanation":"Convenience is not the evaluation criterion investors apply here."},
      {"text":"realistic","explanation":"Correct: investors require assumptions that are plausible and evidence-based."}
    ]'::jsonb,
    '[3]'::jsonb,
    CURRENT_TIMESTAMP
), (
    'q_language_english_c1_001',
    'language',
    'english',
    5,
    'Although the sample size was large, the conclusion remained ___ because key variables were not controlled.',
    'C1',
    '[
      {"text":"tentative","explanation":"Correct: without controlling key variables, conclusions stay provisional."},
      {"text":"comprehensive","explanation":"Large samples do not automatically make conclusions comprehensive."},
      {"text":"transparent","explanation":"Transparency concerns clarity, not evidential certainty by itself."},
      {"text":"efficient","explanation":"Efficiency describes process speed, not inferential strength."}
    ]'::jsonb,
    '[0]'::jsonb,
    CURRENT_TIMESTAMP
), (
    'q_language_english_c2_001',
    'language',
    'english',
    6,
    'In her final chapter, the author drew a ___ distinction between legal compliance and moral legitimacy.',
    'C2',
    '[
      {"text":"ordinary","explanation":"Ordinary does not capture the subtle conceptual separation described."},
      {"text":"nuanced","explanation":"Correct: nuanced conveys fine-grained, precise conceptual differentiation."},
      {"text":"random","explanation":"Random would undermine the intentional analytical contrast."},
      {"text":"brief","explanation":"Brief describes length, not intellectual precision of distinction."}
    ]'::jsonb,
    '[1]'::jsonb,
    CURRENT_TIMESTAMP
);
