import { NextResponse } from "next/server";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { readUserDailySubmittedCount } from "@/app/api/test/session/repo/user";
import { isUserPro } from "@/lib/billing/pro";
import { MAX_NON_PRO_DAILY_SUBMITTED_QUESTION_COUNT } from "@/lib/config/testPolicy";

export const runtime = "nodejs";

export async function GET() {
  const userId = await readAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const [isPro, dailySubmittedCount] = await Promise.all([
    isUserPro(userId),
    readUserDailySubmittedCount(userId),
  ]);

  return NextResponse.json({
    isPro,
    dailySubmittedCount,
    dailySubmittedQuota: isPro
      ? null
      : MAX_NON_PRO_DAILY_SUBMITTED_QUESTION_COUNT,
  });
}
