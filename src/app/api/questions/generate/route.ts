import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseTestRunParams } from "@/app/test/run/questionRunner/session/params";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { generateQuestionWithAI } from "./ai";
import { generateMockQuestion } from "./mock";

const ANONYMOUS_QUESTION_COUNT_COOKIE_NAME = "ti-app-anon-question-count";
const ANONYMOUS_QUESTION_COUNT_COOKIE_TTL_SECONDS = 60 * 60 * 24;
const MAX_ANONYMOUS_QUESTION_COUNT = 5;

function hasOpenAiApiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function parseAnonymousQuestionCount(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

async function readAnonymousQuestionCount(): Promise<number> {
  const cookieStore = await cookies();

  return parseAnonymousQuestionCount(
    cookieStore.get(ANONYMOUS_QUESTION_COUNT_COOKIE_NAME)?.value,
  );
}

function withAnonymousQuestionCountCookie(
  response: NextResponse,
  anonymousQuestionCount: number,
): NextResponse {
  response.cookies.set(
    ANONYMOUS_QUESTION_COUNT_COOKIE_NAME,
    String(anonymousQuestionCount + 1),
    {
      httpOnly: true,
      maxAge: ANONYMOUS_QUESTION_COUNT_COOKIE_TTL_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );

  return response;
}

function createSuccessResponse(
  question: unknown,
  userId: string | null,
  anonymousQuestionCount: number,
): NextResponse {
  const response = NextResponse.json({ question });

  if (userId) {
    return response;
  }

  return withAnonymousQuestionCountCookie(response, anonymousQuestionCount);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseTestRunParams(body);

  if (!input) {
    return NextResponse.json(
      { error: "subjectId, subcategoryId, and difficulty are required." },
      { status: 400 },
    );
  }

  const userId = await readAuthenticatedUserId();
  const anonymousQuestionCount = userId ? 0 : await readAnonymousQuestionCount();

  if (!userId && anonymousQuestionCount >= MAX_ANONYMOUS_QUESTION_COUNT) {
    return NextResponse.json(
      {
        error: "You have reached the anonymous limit of 5 questions. Please log in to continue.",
      },
      { status: 403 },
    );
  }

  if (!hasOpenAiApiKey()) {
    return createSuccessResponse(
      generateMockQuestion(input),
      userId,
      anonymousQuestionCount,
    );
  }

  try {
    return createSuccessResponse(
      await generateQuestionWithAI(input),
      userId,
      anonymousQuestionCount,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate question.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
