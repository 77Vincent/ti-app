import type { Session } from "next-auth";

export function hasAuthenticatedUser(session: Session | null): boolean {
  return Boolean(session?.user);
}
