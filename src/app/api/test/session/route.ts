import { NextResponse } from "next/server";
import {
  parseTestParam,
  type TestSession,
} from "@/lib/testSession/validation";
import { MAX_ANONYMOUS_QUESTION_COUNT } from "@/lib/config/testPolicy";
import { isNonEmptyString } from "@/lib/string";
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

function toTestSessionPayload(
  session: Awaited<ReturnType<typeof readTestSession>>
    | Awaited<ReturnType<typeof upsertTestSession>>,
): TestSession | null {
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
    difficulty: params.difficulty,
    id: session.id,
    submittedCount: session.submittedCount,
  };
}

async function readActiveSession(
  request: Request,
  userId: string | null,
): Promise<TestSession | null> {
  const sessionId = new URL(request.url).searchParams.get("sessionId");
  if (!isNonEmptyString(sessionId)) {
    return null;
  }

  if (userId) {
    return toTestSessionPayload(
      await readTestSession({ id: sessionId, userId }),
    );
  }

  const anonymousSessionId = await readAnonymousTestSessionCookie();
  if (!anonymousSessionId) {
    return null;
  }

  return toTestSessionPayload(
    await readTestSession({ id: sessionId, anonymousSessionId }),
  );
}

export async function GET(request: Request) {
  const userId = await readAuthenticatedUserId();
  const session = await readActiveSession(request, userId);

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

  if (userId) {
    const session = toTestSessionPayload(
      await upsertTestSession(
        {
          userId,
          subjectId: params.subjectId,
          subcategoryId: params.subcategoryId,
        },
        id,
        params,
      ),
    );

    if (!session) {
      return NextResponse.json({ error: "Failed to start test session." }, { status: 500 });
    }

    return NextResponse.json({ session });
  }

  const anonymousSessionId =
    (await readAnonymousTestSessionCookie()) ?? crypto.randomUUID();
  const session = toTestSessionPayload(
    await upsertTestSession(
      {
        anonymousSessionId,
      },
      id,
      params,
    ),
  );

  if (!session) {
    return NextResponse.json({ error: "Failed to start test session." }, { status: 500 });
  }

  const response = NextResponse.json({ session });
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

  const sessionId = (body as { sessionId?: unknown } | null)?.sessionId;
  if (!isNonEmptyString(sessionId)) {
    return NextResponse.json(
      {
        error: "sessionId must be a non-empty string.",
      },
      { status: 400 },
    );
  }

  const isCorrect = (body as { isCorrect?: unknown } | null)?.isCorrect;
  if (typeof isCorrect !== "boolean") {
    return NextResponse.json(
      {
        error: "isCorrect must be a boolean.",
      },
      { status: 400 },
    );
  }

  const userId = await readAuthenticatedUserId();
  const response = NextResponse.json({ ok: true });

  if (userId) {
    const updatedCount = await incrementTestSessionProgress(
      { id: sessionId, userId },
      isCorrect,
    );
    if (updatedCount > 0) {
      return response;
    }

    return NextResponse.json(
      {
        error: "Test session not found.",
      },
      { status: 404 },
    );
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
    { id: sessionId, anonymousSessionId },
    isCorrect,
    MAX_ANONYMOUS_QUESTION_COUNT,
  );
  if (updatedCount > 0) {
    return response;
  }

  const session = await readTestSession({ id: sessionId, anonymousSessionId });
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
