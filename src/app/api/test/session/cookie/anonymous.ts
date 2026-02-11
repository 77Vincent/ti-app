import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  parseTestRunParams,
  parseTestRunSession,
  type TestRunSession,
} from "@/app/test/run/questionRunner/session/params";
import { ANONYMOUS_SESSION_TTL } from "@/lib/config/testPolicy";
import { isNonEmptyString } from "@/lib/string";

const ANONYMOUS_TEST_SESSION_COOKIE_NAME = "ti-app-anon-test-session";

export async function readAnonymousTestSessionCookie(): Promise<TestRunSession | null> {
  const cookieStore = await cookies();
  const rawSessionValue =
    cookieStore.get(ANONYMOUS_TEST_SESSION_COOKIE_NAME)?.value || null;

  if (!isNonEmptyString(rawSessionValue)) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(rawSessionValue));
    const session = parseTestRunSession(parsed);
    if (session) {
      return session;
    }

    const params = parseTestRunParams(parsed);
    if (!params) {
      return null;
    }

    return {
      ...params,
      startedAtMs: Date.now(),
    };
  } catch {
    return null;
  }
}

export function persistAnonymousTestSessionCookie(
  response: NextResponse,
  session: TestRunSession,
): NextResponse {
  response.cookies.set(
    ANONYMOUS_TEST_SESSION_COOKIE_NAME,
    encodeURIComponent(JSON.stringify(session)),
    {
      httpOnly: true,
      maxAge: ANONYMOUS_SESSION_TTL,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );

  return response;
}

export function clearAnonymousTestSessionCookie(
  response: NextResponse,
): NextResponse {
  response.cookies.delete({
    name: ANONYMOUS_TEST_SESSION_COOKIE_NAME,
    path: "/",
  });

  return response;
}
