import { getSession } from "next-auth/react";

export async function readPerformanceUserCacheKey(): Promise<string> {
  const session = await getSession();
  const email = session?.user?.email?.trim().toLowerCase();
  if (email) {
    return email;
  }

  const name = session?.user?.name?.trim().toLowerCase();
  if (name) {
    return `name:${name}`;
  }

  return "anonymous";
}
