import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  parseTestRunParams,
  type TestRunParams,
} from "@/app/test/run/questionRunner/session/params";
import { isNonEmptyString } from "@/lib/string";

const ANONYMOUS_TEST_SESSION_COOKIE_NAME = "ti-app-anon-test-session";
const ANONYMOUS_TEST_SESSION_COOKIE_TTL_SECONDS = 60 * 60 * 24;
const SESSION_TOKEN_COOKIE_NAMES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
] as const;

export async function readSessionTokenCookieValues(): Promise<string[]> {
  const cookieStore = await cookies();

  return SESSION_TOKEN_COOKIE_NAMES.map(
    (cookieName) => cookieStore.get(cookieName)?.value,
  ).filter(isNonEmptyString);
}

export async function readAnonymousTestSessionCookie(): Promise<TestRunParams | null> {
  const cookieStore = await cookies();
  const rawSessionValue =
    cookieStore.get(ANONYMOUS_TEST_SESSION_COOKIE_NAME)?.value || null;

  if (!isNonEmptyString(rawSessionValue)) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(rawSessionValue));
    return parseTestRunParams(parsed);
  } catch {
    return null;
  }
}

export function persistAnonymousTestSessionCookie(
  response: NextResponse,
  params: TestRunParams,
): NextResponse {
  response.cookies.set(
      ANONYMOUS_TEST_SESSION_COOKIE_NAME,
      encodeURIComponent(JSON.stringify(params)),
      {
        httpOnly: true,
        maxAge: ANONYMOUS_TEST_SESSION_COOKIE_TTL_SECONDS,
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
