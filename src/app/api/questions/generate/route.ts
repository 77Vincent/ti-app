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
    id: Math.random().toString(36).substring(2, 10),
    questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
    prompt: Math.random().toString(36).substring(2, 10) + ": What is the capital of France?",
    options: [
      { id: "A", text: "Berlin", explanation: Math.random().toString(36).substring(2, 10) + " is incorrect." },
      { id: "B", text: "Madrid", explanation: Math.random().toString(36).substring(2, 10) + " is incorrect." },
      { id: "C", text: "Paris", explanation: Math.random().toString(36).substring(2, 10) + " is correct." },
      { id: "D", text: "Rome", explanation: Math.random().toString(36).substring(2, 10) + " is incorrect." },
    ],
    correctOptionIds: ["C"],
  };

  return NextResponse.json({ question });
}
