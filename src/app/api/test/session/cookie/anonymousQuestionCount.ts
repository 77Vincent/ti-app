import { ANONYMOUS_TTL } from "@/lib/config/testPolicy";
import { COOKIE_PATHS } from "@/lib/config/paths";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const ANONYMOUS_QUESTION_COUNT_COOKIE_NAME = "ti-app-anon-question-count";

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
      maxAge: ANONYMOUS_TTL,
      path: COOKIE_PATHS.ROOT,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );

  return response;
}
