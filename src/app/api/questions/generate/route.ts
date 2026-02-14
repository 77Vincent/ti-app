import { NextResponse } from "next/server";
import { parseQuestionParam } from "@/lib/testSession/validation";
import { mapGeneratedQuestionToQuestionPoolInput } from "../pool/input";
import {
  countQuestionPoolMatches,
  readQuestionFromPool,
  upsertQuestionPool,
} from "../pool/repo";
import { generateMockQuestion } from "./mock";
import { generateQuestionWithAI } from "@/lib/question/ai";

const DB_SOURCE_BASE_SCORE = 100;

function shouldUseQuestionPool(matchCount: number): boolean {
  if (matchCount <= 1) {
    return false;
  }

  const probability = matchCount / (DB_SOURCE_BASE_SCORE + matchCount);

  return Math.random() < probability;
}

function hasOpenAiApiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
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

  // a short-circuit for testing with mock data
  // without real fetching from ai or question pool
  if (!hasOpenAiApiKey()) {
    const m = generateMockQuestion(input)
    return NextResponse.json({
      question: m,
      nextQuestion: m,
    });
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

    const [question, nextQuestion] = await generateQuestionWithAI(input);

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
