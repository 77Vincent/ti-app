import { NextResponse } from "next/server";
import type { Question } from "@/lib/question/model";
import { parseQuestionParam } from "@/lib/testSession/validation";
import {
  MAX_NON_PRO_DAILY_SUBMITTED_QUESTION_COUNT,
  MAX_RECENT_QUESTION_RESULT_COUNT,
} from "@/lib/config/testPolicy";
import { isUserPro } from "@/lib/billing/pro";
import { readAuthenticatedUserId } from "../../test/session/auth";
import { readUserDailySubmittedCount } from "../../test/session/repo/user";
import { isNonEmptyString } from "@/lib/string";
import { shuffleQuestionOptions } from "@/lib/question/shuffle";
import {
  readQuestionFromPoolById,
  readRandomQuestionFromPool,
} from "../pool/repo";
import {
  readTestSessionQuestionState,
  updateTestSessionCurrentQuestionId,
} from "../../test/session/repo/testSession";

function noQuestionFoundResponse() {
  return NextResponse.json(
    { error: "No question found for this context." },
    { status: 404 },
  );
}

function withShuffledOptions(
  question: Question,
  sessionId: string | null,
): Question {
  const seedKey = sessionId ? `${sessionId}:${question.id}` : question.id;
  return shuffleQuestionOptions(question, seedKey);
}

function buildRecentExcludedQuestionIds(
  recentQuestionIds: string[],
  currentQuestionId: string | null,
): string[] {
  const recentVisitedQuestionIds = currentQuestionId
    ? [...recentQuestionIds, currentQuestionId]
    : recentQuestionIds;

  return Array.from(new Set(recentVisitedQuestionIds)).slice(
    -MAX_RECENT_QUESTION_RESULT_COUNT,
  );
}

async function readDailyLimitResponse(): Promise<NextResponse | null> {
  const userId = await readAuthenticatedUserId();
  if (!userId) {
    return null;
  }

  const dailySubmittedCount = await readUserDailySubmittedCount(userId);
  if (await isUserPro(userId)) {
    return null;
  }

  if (dailySubmittedCount < MAX_NON_PRO_DAILY_SUBMITTED_QUESTION_COUNT) {
    return null;
  }

  return NextResponse.json(
    {
      error: `You have reached the free plan daily limit of ${MAX_NON_PRO_DAILY_SUBMITTED_QUESTION_COUNT} submitted questions. Upgrade to Pro for unlimited attempts.`,
    },
    { status: 429 },
  );
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
    const sessionId = (body as { sessionId?: unknown } | null)?.sessionId;
    const next = (body as { next?: unknown } | null)?.next;
    const isNext = next === true;

    const dailyLimitResponse = await readDailyLimitResponse();
    if (dailyLimitResponse) {
      return dailyLimitResponse;
    }

    if (isNonEmptyString(sessionId)) {
      const session = await readTestSessionQuestionState(sessionId);
      if (session) {
        if (!isNext && session.currentQuestionId) {
          const currentQuestion = await readQuestionFromPoolById(
            input,
            session.currentQuestionId,
          );
          if (currentQuestion) {
            return NextResponse.json({
              question: withShuffledOptions(currentQuestion, sessionId),
            });
          }
        }

        const excludedQuestionIds = buildRecentExcludedQuestionIds(
          session.recentQuestionIds,
          session.currentQuestionId,
        );
        const nextQuestion = await readRandomQuestionFromPool(input, {
          excludeQuestionIds: excludedQuestionIds,
        });
        if (!nextQuestion) {
          return noQuestionFoundResponse();
        }

        await updateTestSessionCurrentQuestionId(session.id, nextQuestion.id);
        return NextResponse.json({
          question: withShuffledOptions(nextQuestion, sessionId),
        });
      }
    }

    const question = await readRandomQuestionFromPool(input);
    if (!question) {
      return noQuestionFoundResponse();
    }

    return NextResponse.json({ question: withShuffledOptions(question, null) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch question.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
