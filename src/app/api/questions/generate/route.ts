import {
  DIFFICULTY_OPTIONS,
  getOrderedSubcategories,
  getSubjectById,
  QUESTION_TYPES,
} from "@/lib/meta";
import type { DifficultyLevel } from "@/lib/meta";
import type {
  MultipleAnswerQuestion,
  MultipleChoiceQuestion,
  Question,
  QuestionOption,
  QuestionOptionId,
} from "@/modules/questionRunner/types";
import { NextResponse } from "next/server";

type GenerateQuestionRequest = {
  subjectId: string;
  subcategoryId: string;
  difficulty: DifficultyLevel;
};

type TemplateBase = {
  id: string;
  prompt: string;
  options: QuestionOption[];
  allowedDifficulties?: DifficultyLevel[];
};

type MultipleChoiceTemplate = TemplateBase & {
  questionType: typeof QUESTION_TYPES.MULTIPLE_CHOICE;
  correctOptionId: QuestionOptionId;
};

type MultipleAnswerTemplate = TemplateBase & {
  questionType: typeof QUESTION_TYPES.MULTIPLE_ANSWER;
  correctOptionIds: QuestionOptionId[];
};

type QuestionTemplate = MultipleChoiceTemplate | MultipleAnswerTemplate;

const TEMPLATE_BY_SUBCATEGORY: Record<string, QuestionTemplate[]> = {
  english: [
    {
      id: "eng-grammar-1",
      questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
      prompt: "Choose the sentence with correct subject-verb agreement.",
      options: [
        { id: "A", text: "They was ready for the exam." },
        { id: "B", text: "They were ready for the exam." },
        { id: "C", text: "They is ready for the exam." },
        { id: "D", text: "They be ready for the exam." },
      ],
      correctOptionId: "B",
    },
    {
      id: "eng-pos-1",
      questionType: QUESTION_TYPES.MULTIPLE_ANSWER,
      prompt: "Select all nouns in: \"The bright stars lit the sky.\"",
      options: [
        { id: "A", text: "bright" },
        { id: "B", text: "stars" },
        { id: "C", text: "lit" },
        { id: "D", text: "sky" },
      ],
      correctOptionIds: ["B", "D"],
    },
  ],
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDifficulty(value: string): value is DifficultyLevel {
  return DIFFICULTY_OPTIONS.some((difficulty) => difficulty.id === value);
}

function parseRequestBody(body: unknown): GenerateQuestionRequest | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const { subjectId, subcategoryId, difficulty } = body as Record<string, unknown>;

  if (
    !isNonEmptyString(subjectId) ||
    !isNonEmptyString(subcategoryId) ||
    !isNonEmptyString(difficulty) ||
    !isValidDifficulty(difficulty)
  ) {
    return null;
  }

  return {
    subjectId,
    subcategoryId,
    difficulty,
  };
}

function toQuestion(template: QuestionTemplate, difficulty: DifficultyLevel): Question {
  const id = `${template.id}-${difficulty}-${Date.now()}`;
  const prompt = `[${difficulty}] ${template.prompt}`;

  if ("correctOptionId" in template) {
    const question: MultipleChoiceQuestion = {
      id,
      prompt,
      questionType: template.questionType,
      options: template.options,
      correctOptionId: template.correctOptionId,
    };
    return question;
  }

  const question: MultipleAnswerQuestion = {
    id,
    prompt,
    questionType: template.questionType,
    options: template.options,
    correctOptionIds: template.correctOptionIds,
  };
  return question;
}

function pickTemplate(
  templates: QuestionTemplate[],
  difficulty: DifficultyLevel,
): QuestionTemplate {
  const filtered = templates.filter(
    (template) =>
      !template.allowedDifficulties ||
      template.allowedDifficulties.includes(difficulty),
  );
  const pool = filtered.length > 0 ? filtered : templates;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseRequestBody(body);

  if (!input) {
    return NextResponse.json(
      { error: "subjectId, subcategoryId, and difficulty are required." },
      { status: 400 },
    );
  }

  const subject = getSubjectById(input.subjectId);

  if (!subject) {
    return NextResponse.json({ error: "Invalid subjectId." }, { status: 400 });
  }

  const subcategory = getOrderedSubcategories(input.subjectId).find(
    (item) => item.id === input.subcategoryId,
  );

  if (!subcategory) {
    return NextResponse.json({ error: "Invalid subcategoryId." }, { status: 400 });
  }

  const templates = TEMPLATE_BY_SUBCATEGORY[input.subcategoryId] ?? [];

  if (templates.length === 0) {
    return NextResponse.json(
      { error: "No question template configured for this subcategory." },
      { status: 500 },
    );
  }

  const allowedTemplates = templates.filter((template) =>
    subcategory.questionTypesAllowed.includes(template.questionType),
  );

  if (allowedTemplates.length === 0) {
    return NextResponse.json(
      { error: "No template matches allowed question types for this subcategory." },
      { status: 500 },
    );
  }

  const template = pickTemplate(allowedTemplates, input.difficulty);
  const question = toQuestion(template, input.difficulty);

  return NextResponse.json({ question });
}
