import { NextResponse } from "next/server";
import { parseTestParam } from "@/lib/validation/testSession";
import { buildQuestion } from "./service/question";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseTestParam(body);

  if (!input) {
    return NextResponse.json(
      { error: "subjectId, subcategoryId, difficulty, and goal are required." },
      { status: 400 },
    );
  }

  try {
    const question = await buildQuestion(input);
    return NextResponse.json({ question });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate question.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
