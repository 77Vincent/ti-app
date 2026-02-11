import { NextResponse } from "next/server";
import {
  parseTestRunParams,
  type TestRunParams,
} from "@/app/test/run/questionRunner/session/params";
import {
  persistAnonymousIdCookie,
  readAnonymousIdCookie,
  readSessionTokenCookieValues,
} from "./cookie";
import {
  deleteTestSession,
  findUserIdBySessionToken,
  readTestSession,
  type UserTestSessionWhere,
  upsertTestSession,
} from "./repo";

export const runtime = "nodejs";

type TestSessionIdentity = {
  userId: string | null;
  anonymousId: string | null;
  shouldPersistAnonymousCookie: boolean;
};

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

async function resolveTestSessionIdentity({
  createAnonymousId,
}: {
  createAnonymousId: boolean;
}): Promise<TestSessionIdentity> {
  const userId = await readAuthenticatedUserId();

  if (userId) {
    return {
      userId,
      anonymousId: null,
      shouldPersistAnonymousCookie: false,
    };
  }

  const existingAnonymousId = await readAnonymousIdCookie();

  if (existingAnonymousId) {
    return {
      userId: null,
      anonymousId: existingAnonymousId,
      shouldPersistAnonymousCookie: false,
    };
  }

  if (!createAnonymousId) {
    return {
      userId: null,
      anonymousId: null,
      shouldPersistAnonymousCookie: false,
    };
  }

  return {
    userId: null,
    anonymousId: crypto.randomUUID(),
    shouldPersistAnonymousCookie: true,
  };
}

function resolveUserSessionWhere(
  identity: TestSessionIdentity,
): UserTestSessionWhere | null {
  if (identity.userId) {
    return {
      userId: identity.userId,
    };
  }

  return null;
}

async function readActiveSession(
  identity: TestSessionIdentity,
): Promise<TestRunParams | null> {
  const where = resolveUserSessionWhere(identity);

  if (!where) {
    return null;
  }

  const session = await readTestSession(where);

  return parseTestRunParams(session);
}

export async function GET() {
  const identity = await resolveTestSessionIdentity({ createAnonymousId: true });
  const session = await readActiveSession(identity);

  const response = NextResponse.json({ session });
  return persistAnonymousIdCookie(
    response,
    identity.anonymousId,
    identity.shouldPersistAnonymousCookie,
  );
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

  const identity = await resolveTestSessionIdentity({ createAnonymousId: true });
  const where = resolveUserSessionWhere(identity);

  if (where) {
    await upsertTestSession(where, params);
  }

  const response = NextResponse.json({ ok: true });
  return persistAnonymousIdCookie(
    response,
    identity.anonymousId,
    identity.shouldPersistAnonymousCookie,
  );
}

export async function DELETE() {
  const identity = await resolveTestSessionIdentity({ createAnonymousId: false });
  const where = resolveUserSessionWhere(identity);

  if (where) {
    await deleteTestSession(where);
  }

  return NextResponse.json({ ok: true });
}
