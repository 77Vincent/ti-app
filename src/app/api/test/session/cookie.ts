import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { isNonEmptyString } from "@/lib/string";

const ANONYMOUS_ID_COOKIE_NAME = "ti-app-anon-id";
const ANONYMOUS_ID_COOKIE_TTL_SECONDS = 60 * 60;
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

export async function readAnonymousIdCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ANONYMOUS_ID_COOKIE_NAME)?.value?.trim() || null;
}

export function persistAnonymousIdCookie(
  response: NextResponse,
  anonymousId: string | null,
  shouldPersist: boolean,
): NextResponse {
  if (!shouldPersist || !anonymousId) {
    return response;
  }

  response.cookies.set(ANONYMOUS_ID_COOKIE_NAME, anonymousId, {
    httpOnly: true,
    maxAge: ANONYMOUS_ID_COOKIE_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
