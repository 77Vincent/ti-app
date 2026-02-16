import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { ANONYMOUS_TTL } from "@/lib/config/testPolicy";
import { COOKIE_PATHS } from "@/lib/config/paths";
import { isNonEmptyString } from "@/lib/string";

const ANONYMOUS_TEST_SESSION_COOKIE_NAME = "ti-app-anon-test-session";

export async function readAnonymousTestSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const rawSessionValue =
    cookieStore.get(ANONYMOUS_TEST_SESSION_COOKIE_NAME)?.value || null;

  if (!isNonEmptyString(rawSessionValue)) {
    return null;
  }

  try {
    return decodeURIComponent(rawSessionValue);
  } catch {
    return null;
  }
}

export function persistAnonymousTestSessionCookie(
  response: NextResponse,
  anonymousSessionId: string,
): NextResponse {
  response.cookies.set(
    ANONYMOUS_TEST_SESSION_COOKIE_NAME,
    encodeURIComponent(anonymousSessionId),
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

export function clearAnonymousTestSessionCookie(
  response: NextResponse,
): NextResponse {
  response.cookies.delete({
    name: ANONYMOUS_TEST_SESSION_COOKIE_NAME,
    path: COOKIE_PATHS.ROOT,
  });

  return response;
}
