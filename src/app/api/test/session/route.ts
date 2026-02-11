import { NextResponse } from "next/server";
import {
  parseTestRunParams,
  type TestRunParams,
} from "@/app/test/run/questionRunner/session/params";
import {
  clearAnonymousTestSessionCookie,
  persistAnonymousTestSessionCookie,
  readAnonymousTestSessionCookie,
  readSessionTokenCookieValues,
} from "./cookie";
import {
  deleteTestSession,
  findUserIdBySessionToken,
  readTestSession,
  upsertTestSession,
} from "./repo";

export const runtime = "nodejs";

async function readAuthenticatedUserId(): Promise<string | null> {
  const sessionTokens = await readSessionTokenCookieValues();

  for (const sessionToken of sessionTokens) {
    const userId = await findUserIdBySessionToken(sessionToken);
    if (userId) {
      return userId;
    }
  }

  return null;
}

async function readActiveSession(
  userId: string | null,
): Promise<TestRunParams | null> {
  if (!userId) {
    return readAnonymousTestSessionCookie();
  }

  const session = await readTestSession({ userId });

  return parseTestRunParams(session);
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
        error: "subjectId, subcategoryId, and difficulty are required.",
      },
      { status: 400 },
    );
  }

  const userId = await readAuthenticatedUserId();
  const response = NextResponse.json({ ok: true });

  if (userId) {
    await upsertTestSession({ userId }, params);
  } else {
    persistAnonymousTestSessionCookie(response, params);
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
