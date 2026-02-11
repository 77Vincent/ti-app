import { NextResponse } from "next/server";
import {
  parseTestRunParams,
  type TestRunSession,
} from "@/lib/validation/testSession";
import {
  clearAnonymousTestSessionCookie,
  persistAnonymousTestSessionCookie,
  readAnonymousTestSessionCookie,
} from "./cookie/anonymous";
import { readAuthenticatedUserId } from "./auth";
import {
  deleteTestSession,
  readTestSession,
  upsertTestSession,
} from "./repo/testSession";

export const runtime = "nodejs";

async function readActiveSession(
  userId: string | null,
): Promise<TestRunSession | null> {
  if (!userId) {
    return readAnonymousTestSessionCookie();
  }

  const session = await readTestSession({ userId });
  if (!session) {
    return null;
  }

  const params = parseTestRunParams(session);
  if (!params) {
    return null;
  }

  return {
    ...params,
    startedAtMs: session.updatedAt.getTime(),
  };
}

export async function GET() {
  const userId = await readAuthenticatedUserId();
  const session = await readActiveSession(userId);

  return NextResponse.json({ session });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const params = parseTestRunParams(body);

  if (!params) {
    return NextResponse.json(
      {
        error: "subjectId, subcategoryId, difficulty, and goal are required.",
      },
      { status: 400 },
    );
  }

  const userId = await readAuthenticatedUserId();
  const response = NextResponse.json({ ok: true });
  const startedAtMs = Date.now();

  if (userId) {
    await upsertTestSession({ userId }, params);
  } else {
    persistAnonymousTestSessionCookie(response, {
      ...params,
      startedAtMs,
    });
  }

  return response;
}

export async function DELETE() {
  const userId = await readAuthenticatedUserId();
  const response = NextResponse.json({ ok: true });

  if (userId) {
    await deleteTestSession({ userId });
  }

  clearAnonymousTestSessionCookie(response);

  return response;
}
