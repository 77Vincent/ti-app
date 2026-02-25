import { NextResponse } from "next/server";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { isUserPro } from "@/lib/billing/pro";

export const runtime = "nodejs";

export async function GET() {
  const userId = await readAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({
    isPro: await isUserPro(userId),
  });
}
