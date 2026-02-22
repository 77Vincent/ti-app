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
    'Tom is late for class. He runs to school and says, "I am ___, teacher."',
    'A1',
    '[
      {"text":"sorry","explanation":"Correct adjective for apologizing in this context."},
      {"text":"hungry","explanation":"Possible feeling, but it does not fit the apology context."},
      {"text":"run","explanation":"Verb form does not fit after I am in this sentence."},
      {"text":"to school","explanation":"Prepositional phrase does not complete the sentence naturally."}
    ]'::jsonb,
    '[0]'::jsonb,
    CURRENT_TIMESTAMP
), (
    'q_language_english_a2_001',
    'language',
    'english',
    2,
    'Emma forgot her lunch at home. At noon, she feels hungry, so her friend shares a sandwich and she says, "Thank you for being so ___."',
    'A2',
    '[
      {"text":"kind","explanation":"Correct adjective after being so in this sentence."},
      {"text":"kindly","explanation":"Adverb form does not fit this adjective position."},
      {"text":"kindness","explanation":"Noun form does not fit after being so."},
      {"text":"kinder than","explanation":"Comparative phrase is incomplete in this context."}
    ]'::jsonb,
    '[0]'::jsonb,
    CURRENT_TIMESTAMP
), (
    'q_language_english_b1_001',
    'language',
    'english',
    3,
    'Ravi studies every evening, but he still feels nervous before tests. His teacher reminds him to review calmly, sleep early, and trust his preparation. During the exam, Ravi tries to stay ___.',
    'B1',
    '[
      {"text":"focused","explanation":"Correct adjective after stay in this sentence."},
      {"text":"focus","explanation":"Base verb does not fit after stay here."},
      {"text":"to focus","explanation":"Infinitive form does not fit this structure."},
      {"text":"focuses","explanation":"Third-person verb form is grammatically incorrect here."}
    ]'::jsonb,
    '[0]'::jsonb,
    CURRENT_TIMESTAMP
), (
    'q_language_english_b2_001',
    'language',
    'english',
    4,
    'After moving to a new city, Lina found the fast pace overwhelming. She created a weekly plan, joined a local club, and asked neighbors for advice. Within a month, she felt much more ___ in her daily life.',
    'B2',
    '[
      {"text":"confident","explanation":"Correct adjective after felt much more in this context."},
      {"text":"confidence","explanation":"Noun form does not fit the adjective slot."},
      {"text":"confidently","explanation":"Adverb form does not fit after felt more."},
      {"text":"confide","explanation":"Verb form does not match sentence grammar."}
    ]'::jsonb,
    '[0]'::jsonb,
    CURRENT_TIMESTAMP
), (
    'q_language_english_c1_001',
    'language',
    'english',
    5,
    'Marcus had always been confident in technical meetings, yet his first presentation to clients went poorly because he used too much jargon. After feedback, he reorganized his slides, added practical examples, and practiced with colleagues. His second presentation was far more ___ and persuasive.',
    'C1',
    '[
      {"text":"clear","explanation":"Correct adjective paired with persuasive in this sentence."},
      {"text":"clearly","explanation":"Adverb form does not fit after was far more."},
      {"text":"clarity","explanation":"Noun form does not fit this adjective position."},
      {"text":"clarify","explanation":"Verb form is not grammatically correct here."}
    ]'::jsonb,
    '[0]'::jsonb,
    CURRENT_TIMESTAMP
), (
    'q_language_english_c2_001',
    'language',
    'english',
    6,
    'During a public policy debate, Nora noticed that both sides cited selective evidence to support predetermined conclusions. Instead of reacting immediately, she compared methodologies, checked original datasets, and mapped unstated assumptions. Her final response was praised for being analytically rigorous, intellectually fair, and remarkably ___.',
    'C2',
    '[
      {"text":"balanced","explanation":"Best adjective for describing fair and rigorous reasoning."},
      {"text":"balance","explanation":"Noun or verb form does not fit the adjective slot."},
      {"text":"balancingly","explanation":"This form is unnatural and not standard English."},
      {"text":"to balance","explanation":"Infinitive form does not complete the sentence grammar."}
    ]'::jsonb,
    '[0]'::jsonb,
    CURRENT_TIMESTAMP
);
