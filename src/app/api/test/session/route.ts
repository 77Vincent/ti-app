import { NextResponse } from "next/server";
import {
  parseTestParam,
  type TestSession,
} from "@/lib/testSession/validation";
import { MAX_ANONYMOUS_QUESTION_COUNT } from "@/lib/config/testPolicy";
import {
  clearAnonymousTestSessionCookie,
  persistAnonymousTestSessionCookie,
  readAnonymousTestSessionCookie,
} from "./cookie/anonymous";
import { readAuthenticatedUserId } from "./auth";
import {
  deleteTestSession,
  incrementTestSessionProgress,
  readTestSession,
  upsertTestSession,
} from "./repo/testSession";

export const runtime = "nodejs";

async function readActiveSession(
  userId: string | null,
): Promise<TestSession | null> {
  const session = userId
    ? await readTestSession({ userId })
    : await (async () => {
        const anonymousSessionId = await readAnonymousTestSessionCookie();
        if (!anonymousSessionId) {
          return null;
        }

        return readTestSession({ anonymousSessionId });
      })();

  if (!session) {
    return null;
  }

  const params = parseTestParam(session);
  if (!params) {
    return null;
  }

  return {
    ...params,
    correctCount: session.correctCount,
    id: session.id,
    submittedCount: session.submittedCount,
    startedAtMs: session.startedAt.getTime(),
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
        error: "subjectId, subcategoryId, and difficulty are required.",
      },
      { status: 400 },
    );
  }

  const userId = await readAuthenticatedUserId();
  const id = crypto.randomUUID();
  const startedAt = new Date();
  const startedAtMs = startedAt.getTime();
  const session: TestSession = {
    correctCount: 0,
    ...params,
    id,
    startedAtMs,
    submittedCount: 0,
  };
  const response = NextResponse.json({ session });

  if (userId) {
    await upsertTestSession({ userId }, id, params, startedAt);
    return response;
  }

  const anonymousSessionId =
    (await readAnonymousTestSessionCookie()) ?? crypto.randomUUID();
  await upsertTestSession({ anonymousSessionId }, id, params, startedAt);
  persistAnonymousTestSessionCookie(response, anonymousSessionId);

  return response;
}

export async function DELETE() {
  const userId = await readAuthenticatedUserId();
  const response = NextResponse.json({ ok: true });

  if (userId) {
    await deleteTestSession({ userId });
    clearAnonymousTestSessionCookie(response);
    return response;
  }

  const anonymousSessionId = await readAnonymousTestSessionCookie();
  if (anonymousSessionId) {
    await deleteTestSession({ anonymousSessionId });
  }

  clearAnonymousTestSessionCookie(response);

  return response;
}

export async function PATCH(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userId = await readAuthenticatedUserId();
  const response = NextResponse.json({ ok: true });
  const isCorrect = (body as { isCorrect?: unknown } | null)?.isCorrect;
  if (typeof isCorrect !== "boolean") {
    return NextResponse.json(
      {
        error: "isCorrect must be a boolean.",
      },
      { status: 400 },
    );
  }

  if (userId) {
    await incrementTestSessionProgress({ userId }, isCorrect);
    return response;
  }

  const anonymousSessionId = await readAnonymousTestSessionCookie();
  if (!anonymousSessionId) {
    return NextResponse.json(
      {
        error: "Anonymous test session not found.",
      },
      { status: 404 },
    );
  }

  const updatedCount = await incrementTestSessionProgress(
    { anonymousSessionId },
    isCorrect,
    MAX_ANONYMOUS_QUESTION_COUNT,
  );
  if (updatedCount > 0) {
    return response;
  }

  const session = await readTestSession({ anonymousSessionId });
  if (!session) {
    return NextResponse.json(
      {
        error: "Anonymous test session not found.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      error: `You have reached the anonymous limit of ${MAX_ANONYMOUS_QUESTION_COUNT} questions. Please log in to continue.`,
    },
    { status: 403 },
  );
}
