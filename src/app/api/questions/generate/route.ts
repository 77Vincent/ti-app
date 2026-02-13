import { NextResponse } from "next/server";
import { parseQuestionParam } from "@/lib/validation/testSession";
import { buildQuestion } from "./service/question";
import { mapGeneratedQuestionToQuestionPoolInput } from "../pool/input";
import { readQuestionFromPool, upsertQuestionPool } from "../pool/repo";

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
      { error: "subjectId, subcategoryId, and difficulty are required." },
      { status: 400 },
    );
  }

  try {
    const pooledQuestion = await readQuestionFromPool(input);

    if (pooledQuestion) {
      return NextResponse.json({ question: pooledQuestion });
    }

    const question = await buildQuestion(input);

    try {
      await upsertQuestionPool(
        mapGeneratedQuestionToQuestionPoolInput(input, question),
      );
    } catch (error) {
      console.error("Failed to persist generated question.", error);
    }

    return NextResponse.json({ question });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate question.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
