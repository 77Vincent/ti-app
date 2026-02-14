import { NextResponse } from "next/server";
import { parseQuestionParam } from "@/lib/validation/testSession";
import { buildQuestion } from "./service/question";
import { mapGeneratedQuestionToQuestionPoolInput } from "../pool/input";
import {
  countQuestionPoolMatches,
  readQuestionFromPool,
  upsertQuestionPool,
} from "../pool/repo";

const DB_SOURCE_BASE_SCORE = 100;

function shouldUseQuestionPool(matchCount: number): boolean {
  if (matchCount <= 1) {
    return false;
  }

  const probability = matchCount / (DB_SOURCE_BASE_SCORE + matchCount);

  return Math.random() < probability;
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

  try {
    const poolMatchCount = await countQuestionPoolMatches(input);

    if (shouldUseQuestionPool(poolMatchCount)) {
      const pooledQuestions = await readQuestionFromPool(input);

      if (pooledQuestions) {
        const [question, nextQuestion] = pooledQuestions;
        return NextResponse.json({ question, nextQuestion });
      }
    }

    const [question, nextQuestion] = await buildQuestion(input);

    const persistResults = await Promise.allSettled(
      [question, nextQuestion].map((generatedQuestion) =>
        upsertQuestionPool(
          mapGeneratedQuestionToQuestionPoolInput(input, generatedQuestion),
        ),
      ),
    );

    for (const result of persistResults) {
      if (result.status === "rejected") {
        console.error("Failed to persist generated question.", result.reason);
      }
    }

    return NextResponse.json({ question, nextQuestion });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate question.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
