import { NextResponse } from "next/server";
import { QUESTION_TYPES } from "@/lib/meta";
import type { Question } from "@/modules/questionRunner/types";
import { generateQuestionWithAI } from "./ai";
import {
  parseGenerateQuestionRequest,
  type GenerateQuestionRequest,
} from "./validation";

const DEFAULT_GENERATOR_MODE = "mock";

function createMockQuestionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `mock-${Math.random().toString(36).slice(2, 10)}`;
}

function generateMockQuestion(input: GenerateQuestionRequest): Question {
  return {
    id: createMockQuestionId(),
    questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
    prompt: `**Mock question** (${input.subjectId} / ${input.subcategoryId} / ${input.difficulty})\n\nWhat is the capital of France?`,
    options: [
      {
        id: "A",
        text: "Berlin",
        explanation: "Berlin is the capital of Germany.",
      },
      {
        id: "B",
        text: "Paris",
        explanation: "Paris is the capital of France.",
      },
      {
        id: "C",
        text: "Madrid",
        explanation: "Madrid is the capital of Spain.",
      },
      {
        id: "D",
        text: "Rome",
        explanation: "Rome is the capital of Italy.",
      },
    ],
    correctOptionIds: ["B"],
  };
}

function isAiGeneratorMode(): boolean {
  const mode = (process.env.QUESTION_GENERATOR_MODE ?? DEFAULT_GENERATOR_MODE)
    .trim()
    .toLowerCase();

  return mode === "ai";
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseGenerateQuestionRequest(body);

  if (!input) {
    return NextResponse.json(
      { error: "subjectId, subcategoryId, and difficulty are required." },
      { status: 400 },
    );
  }

  if (!isAiGeneratorMode()) {
    return NextResponse.json({ question: generateMockQuestion(input) });
  }

  try {
    const question = await generateQuestionWithAI(input);
    return NextResponse.json({ question });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate question.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
