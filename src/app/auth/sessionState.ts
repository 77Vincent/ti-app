import type { Session } from "next-auth";

export const USER_MENU_LOGOUT_KEY = "logout";

export function hasAuthenticatedUser(session: Session | null): boolean {
  return Boolean(session?.user);
}
