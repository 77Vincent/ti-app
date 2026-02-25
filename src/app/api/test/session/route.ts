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
  readTestSessionByContext,
  readTestSession,
  updateTestSessionDifficultyByRecentAccuracy,
  upsertTestSession,
} from "./repo/testSession";

export const runtime = "nodejs";

type SessionSelector =
  | {
      userId: string;
    }
  | {
      anonymousSessionId: string;
    };

function toTestSessionPayload(
  session: Awaited<ReturnType<typeof readTestSession>>
    | Awaited<ReturnType<typeof readTestSessionByContext>>
    | Awaited<ReturnType<typeof updateTestSessionDifficultyByRecentAccuracy>>
    | Awaited<ReturnType<typeof upsertTestSession>>,
): TestSession | null {
  if (!session) {
    return null;
  }

  return {
    subjectId: session.subjectId as TestSession["subjectId"],
    subcategoryId: session.subcategoryId as TestSession["subcategoryId"],
    correctCount: session.correctCount,
    difficulty: session.difficulty,
    id: session.id,
    submittedCount: session.submittedCount,
  };
}

async function readSessionSelector(
  userId: string | null,
): Promise<SessionSelector | null> {
  if (userId) {
    return { userId };
  }

  const anonymousSessionId = await readAnonymousTestSessionCookie();
  if (!anonymousSessionId) {
    return null;
  }

  return { anonymousSessionId };
}

async function readActiveSession(
  request: Request,
  userId: string | null,
): Promise<TestSession | null> {
  const selector = await readSessionSelector(userId);
  if (!selector) {
    return null;
  }

  const searchParams = new URL(request.url).searchParams;
  const subjectId = searchParams.get("subjectId");
  const subcategoryId = searchParams.get("subcategoryId");

  if (
    !isNonEmptyString(subjectId) ||
    !isNonEmptyString(subcategoryId)
  ) {
    return null;
  }

  return toTestSessionPayload(
    await readTestSessionByContext({
      ...selector,
      subjectId,
      subcategoryId,
    }),
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

  const questionId = (body as { questionId: string }).questionId;

  const userId = await readAuthenticatedUserId();

  if (userId) {
    const updatedCount = await incrementTestSessionProgress(
      { id: sessionId, userId },
      isCorrect,
    );
    if (updatedCount > 0) {
      const session = toTestSessionPayload(
        await updateTestSessionDifficultyByRecentAccuracy(
          { id: sessionId, userId },
          isCorrect,
          questionId,
        ),
      );
      if (!session) {
        return NextResponse.json(
          {
            error: "Test session not found.",
          },
          { status: 404 },
        );
      }

      return NextResponse.json({ ok: true, session });
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
    const session = toTestSessionPayload(
      await updateTestSessionDifficultyByRecentAccuracy(
        { id: sessionId, anonymousSessionId },
        isCorrect,
        questionId,
      ),
    );
    if (!session) {
      return NextResponse.json(
        {
          error: "Anonymous test session not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, session });
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
