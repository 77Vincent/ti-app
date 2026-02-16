import { NextResponse } from "next/server";
import { parseQuestionParam } from "@/lib/testSession/validation";
import { mapGeneratedQuestionToQuestionPoolInput } from "../pool/input";
import {
  consumeQuestionFromTestSessionPool,
  upsertTestSessionQuestionPoolLink,
  upsertQuestionPool,
} from "../pool/repo";
import { generateMockQuestion } from "./mock";
import { generateQuestionWithAI } from "@/lib/question/ai";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { readAnonymousTestSessionCookie } from "@/app/api/test/session/cookie/anonymous";
import {
  isTestSessionActive,
  readTestSession,
} from "@/app/api/test/session/repo/testSession";
import type { Question } from "@/lib/question/model";
import type { QuestionParam } from "@/lib/testSession/validation";

function hasOpenAiApiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

async function readActiveTestSessionId(): Promise<string | null> {
  const userId = await readAuthenticatedUserId();
  if (userId) {
    const session = await readTestSession({ userId });
    if (!session) {
      return null;
    }

    return session.id;
  }

  const anonymousSessionId = await readAnonymousTestSessionCookie();
  if (!anonymousSessionId) {
    return null;
  }

  const session = await readTestSession({ anonymousSessionId });
  if (!session) {
    return null;
  }

  return session.id;
}

async function persistTestSessionQuestionPoolLinks(
  sessionId: string | null,
  questionIds: string[],
): Promise<void> {
  if (!sessionId) {
    return;
  }

  if (!(await isTestSessionActive(sessionId))) {
    return;
  }

  const results = await Promise.allSettled(
    questionIds.map((questionId) =>
      upsertTestSessionQuestionPoolLink(sessionId, questionId),
    ),
  );

  for (const result of results) {
    if (result.status === "rejected") {
      console.error(
        "Failed to persist test session question pool link.",
        result.reason,
      );
    }
  }
}

async function persistGeneratedQuestions(
  input: QuestionParam,
  generatedQuestions: [Question, Question],
): Promise<void> {
  const persistResults = await Promise.allSettled(
    generatedQuestions.map((generatedQuestion) =>
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
}

async function generateAndPersistQuestionPair(
  input: QuestionParam,
  sessionId: string | null,
): Promise<[Question, Question]> {
  const generatedQuestions = await generateQuestionWithAI(input);
  await persistGeneratedQuestions(input, generatedQuestions);
  await persistTestSessionQuestionPoolLinks(sessionId, [
    generatedQuestions[0].id,
    generatedQuestions[1].id,
  ]);
  return generatedQuestions;
}

function replenishSessionPoolInBackground(
  input: QuestionParam,
  sessionId: string,
): void {
  void (async () => {
    if (!(await isTestSessionActive(sessionId))) {
      return;
    }

    await generateAndPersistQuestionPair(input, sessionId);
  })().catch((reason) => {
    console.error(
      "Failed to replenish test session question pool in background.",
      reason,
    );
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

  // a short-circuit for testing with mock data
  // without real fetching from ai or question pool
  if (!hasOpenAiApiKey()) {
    const m = generateMockQuestion(input);
    return NextResponse.json({
      question: m,
    });
  }

  try {
    const activeSessionId = await readActiveTestSessionId();

    if (activeSessionId) {
      const sessionPooledQuestion = await consumeQuestionFromTestSessionPool(
        activeSessionId,
        input,
      );
      if (sessionPooledQuestion) {
        replenishSessionPoolInBackground(input, activeSessionId);
        return NextResponse.json({ question: sessionPooledQuestion });
      }
    }

    const [question] = await generateAndPersistQuestionPair(
      input,
      activeSessionId,
    );

    return NextResponse.json({ question });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate question.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
