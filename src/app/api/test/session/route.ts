import { NextResponse } from "next/server";
import {
  parseTestParam,
  type TestSession,
} from "@/lib/validation/testSession";
import {
  clearAnonymousTestSessionCookie,
  persistAnonymousTestSessionCookie,
  readAnonymousTestSessionCookie,
} from "./cookie/anonymous";
import {
  incrementAnonymousQuestionCountCookie,
  readAnonymousQuestionCount,
} from "./cookie/anonymousQuestionCount";
import { readAuthenticatedUserId } from "./auth";
import { MAX_ANONYMOUS_QUESTION_COUNT } from "@/lib/config/testPolicy";
import {
  deleteTestSession,
  readTestSession,
  upsertTestSession,
} from "./repo/testSession";

export const runtime = "nodejs";

async function readActiveSession(
  userId: string | null,
): Promise<TestSession | null> {
  if (!userId) {
    return readAnonymousTestSessionCookie();
  }

  const session = await readTestSession({ userId });
  if (!session) {
    return null;
  }

  const params = parseTestParam(session);
  if (!params) {
    return null;
  }

  return {
    ...params,
    id: session.id,
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

  const params = parseTestParam(body);

  if (!params) {
    return NextResponse.json(
      {
        error: "subjectId, subcategoryId, difficulty, and goal are required.",
      },
      { status: 400 },
    );
  }

  const userId = await readAuthenticatedUserId();
  const id = crypto.randomUUID();
  const startedAtMs = Date.now();
  const session: TestSession = {
    ...params,
    id,
    startedAtMs,
  };
  const response = NextResponse.json({ session });

  if (userId) {
    await upsertTestSession({ userId }, id, params);
  } else {
    persistAnonymousTestSessionCookie(response, session);
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

export async function PATCH() {
  const userId = await readAuthenticatedUserId();
  const response = NextResponse.json({ ok: true });

  if (userId) {
    return response;
  }

  const anonymousQuestionCount = await readAnonymousQuestionCount();
  if (anonymousQuestionCount >= MAX_ANONYMOUS_QUESTION_COUNT) {
    return NextResponse.json(
      {
        error: `You have reached the anonymous limit of ${MAX_ANONYMOUS_QUESTION_COUNT} questions. Please log in to continue.`,
      },
      { status: 403 },
    );
  }

  return incrementAnonymousQuestionCountCookie(response, anonymousQuestionCount);
}
