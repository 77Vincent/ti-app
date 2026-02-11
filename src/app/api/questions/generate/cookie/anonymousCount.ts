import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const ANONYMOUS_QUESTION_COUNT_COOKIE_NAME = "ti-app-anon-question-count";
const ANONYMOUS_QUESTION_COUNT_COOKIE_TTL_SECONDS = 60 * 60 * 24;

export const MAX_ANONYMOUS_QUESTION_COUNT = 5;

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

export async function readAnonymousQuestionCount(): Promise<number> {
  const cookieStore = await cookies();

  return parseAnonymousQuestionCount(
    cookieStore.get(ANONYMOUS_QUESTION_COUNT_COOKIE_NAME)?.value,
  );
}

export function incrementAnonymousQuestionCountCookie(
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
