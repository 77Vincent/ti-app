import { NextResponse } from "next/server";
import { generateQuestionWithAI } from "@/lib/question/ai";
import { parseQuestionParam } from "@/lib/testSession/validation";
import { readRandomQuestionFromPool, upsertQuestionPool } from "../pool/repo";
import type { QuestionParam } from "@/lib/testSession/validation";

function replenishQuestionPoolInBackground(input: QuestionParam): void {
  void (async () => {
    const generatedQuestions = await generateQuestionWithAI(input);
    const results = await Promise.allSettled(
      generatedQuestions.map((question) =>
        upsertQuestionPool({
          id: question.id,
          subjectId: input.subjectId,
          subcategoryId: input.subcategoryId,
          difficulty: input.difficulty,
          questionType: question.questionType,
          prompt: question.prompt,
          options: question.options,
          correctOptionIds: question.correctOptionIds,
        }),
      ),
    );

    for (const result of results) {
      if (result.status === "rejected") {
        console.error(
          "Failed to persist generated question in background.",
          result.reason,
        );
      }
    }
  })().catch((reason) => {
    console.error("Failed to generate questions in background.", reason);
  });
}

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

  replenishQuestionPoolInBackground(input);

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
