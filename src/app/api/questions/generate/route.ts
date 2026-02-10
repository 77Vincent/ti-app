import { NextResponse } from "next/server";
import { generateQuestionWithAI } from "./ai";
import { generateMockQuestion } from "./mock";
import {
  parseGenerateQuestionRequest,
} from "./validation";

const DEFAULT_GENERATOR_MODE = "mock";

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
