import { QUESTION_TYPES } from "@/lib/meta";
import type { Question } from "@/modules/questionRunner/types";
import { NextResponse } from "next/server";
import { parseGenerateQuestionRequest } from "./validation";

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

  const question: Question = {
    id: "q1",
    questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
    prompt: "What is the capital of France?",
    options: [
      { id: "A", text: "Berlin" },
      { id: "B", text: "Madrid" },
      { id: "C", text: "Paris" },
      { id: "D", text: "Rome" },
    ],
    correctOptionId: "C",
  };

  return NextResponse.json({ question });
}
