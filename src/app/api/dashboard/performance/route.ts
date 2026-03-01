import { NextResponse } from "next/server";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { readStats } from "@/lib/stats/data";

export const runtime = "nodejs";

export async function GET() {
  const userId = await readAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await readStats({ userId });
  return NextResponse.json(payload);
}
