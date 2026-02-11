import { cookies } from "next/headers";
import { isNonEmptyString } from "@/lib/string";

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
