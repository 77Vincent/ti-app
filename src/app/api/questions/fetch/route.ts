import { NextResponse } from "next/server";
import { parseQuestionParam } from "@/lib/testSession/validation";
import { readRandomQuestionFromPool } from "../pool/repo";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseQuestionParam(body);

  if (!input) {
    return NextResponse.json(
      { error: "subjectId and subcategoryId are required." },
      { status: 400 },
    );
  }

  try {
    const question = await readRandomQuestionFromPool(input);
    if (!question) {
      return NextResponse.json(
        { error: "No question found for this context." },
        { status: 404 },
      );
    }

    return NextResponse.json({ question });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch question.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
