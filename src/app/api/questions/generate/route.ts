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

  const result = {
    ok: true,
    question: {
      id: "q1",
      type: "multiple_choice",
      prompt: "What is the capital of France?",
      options: [
        { id: "o1", text: "Berlin" },
        { id: "o2", text: "Madrid" },
        { id: "o3", text: "Paris" },
        { id: "o4", text: "Rome" },
      ],
      correctOptionId: "o3",
    },
    error: null,
    status: 200,
  }

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ question: result.question });
}
