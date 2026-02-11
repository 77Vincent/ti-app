import { readSessionTokenCookieValues } from "./cookie/authSession";
import { findUserIdBySessionToken } from "./repo/authSession";

export async function readAuthenticatedUserId(): Promise<string | null> {
  const sessionTokens = await readSessionTokenCookieValues();

  for (const sessionToken of sessionTokens) {
    const userId = await findUserIdBySessionToken(sessionToken);
    if (userId) {
      return userId;
    }
  }

  return null;
}
