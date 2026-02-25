import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_ANONYMOUS_QUESTION_COUNT } from "@/lib/config/testPolicy";

const {
  clearAnonymousTestSessionCookie,
  deleteTestSession,
  incrementTestSessionProgress,
  persistAnonymousTestSessionCookie,
  readAnonymousTestSessionCookie,
  readAuthenticatedUserId,
  readTestSessionByContext,
  readTestSession,
  updateTestSessionDifficultyByRecentAccuracy,
  upsertTestSession,
} = vi.hoisted(() => ({
  clearAnonymousTestSessionCookie: vi.fn((response: Response) => response),
  deleteTestSession: vi.fn(),
  incrementTestSessionProgress: vi.fn(),
  persistAnonymousTestSessionCookie: vi.fn((response: Response) => response),
  readAnonymousTestSessionCookie: vi.fn(),
  readAuthenticatedUserId: vi.fn(),
  readTestSessionByContext: vi.fn(),
  readTestSession: vi.fn(),
  updateTestSessionDifficultyByRecentAccuracy: vi.fn(),
  upsertTestSession: vi.fn(),
}));

vi.mock("./auth", () => ({
  readAuthenticatedUserId,
}));

vi.mock("./cookie/anonymous", () => ({
  clearAnonymousTestSessionCookie,
  persistAnonymousTestSessionCookie,
  readAnonymousTestSessionCookie,
}));

vi.mock("./repo/testSession", () => ({
  deleteTestSession,
  incrementTestSessionProgress,
  readTestSessionByContext,
  readTestSession,
  updateTestSessionDifficultyByRecentAccuracy,
  upsertTestSession,
}));

import { GET, PATCH, POST } from "./route";

const STORED_SESSION = {
  id: "session-1",
  correctCount: 0,
  difficulty: "A1",
  submittedCount: 0,
  subjectId: "language",
  subcategoryId: "english",
} as const;

const VALID_PARAMS = {
  difficulty: "A1",
  subjectId: "language",
  subcategoryId: "english",
} as const;

const SESSION_RESPONSE = {
  ...VALID_PARAMS,
  correctCount: STORED_SESSION.correctCount,
  difficulty: STORED_SESSION.difficulty,
  id: STORED_SESSION.id,
  submittedCount: STORED_SESSION.submittedCount,
} as const;

describe("test session route GET", () => {
  beforeEach(() => {
    readAuthenticatedUserId.mockReset();
    readAnonymousTestSessionCookie.mockReset();
    readTestSessionByContext.mockReset();
    readTestSession.mockReset();

    readAuthenticatedUserId.mockResolvedValue(null);
    readAnonymousTestSessionCookie.mockResolvedValue("anon-1");
    readTestSessionByContext.mockResolvedValue(STORED_SESSION);
    readTestSession.mockResolvedValue(STORED_SESSION);
  });

  it("returns null when subject/subcategory query params are missing", async () => {
    const response = await GET(
      new Request("http://localhost/api/test/session"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ session: null });
    expect(readTestSession).not.toHaveBeenCalled();
    expect(readTestSessionByContext).not.toHaveBeenCalled();
  });

  it("reads authenticated session by subject and subcategory", async () => {
    readAuthenticatedUserId.mockResolvedValueOnce("user-1");

    const response = await GET(
      new Request(
        "http://localhost/api/test/session?subjectId=language&subcategoryId=english",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      session: SESSION_RESPONSE,
    });
    expect(readTestSessionByContext).toHaveBeenCalledWith({
      userId: "user-1",
      subjectId: "language",
      subcategoryId: "english",
    });
    expect(readTestSession).not.toHaveBeenCalled();
    expect(readAnonymousTestSessionCookie).not.toHaveBeenCalled();
  });

  it("reads anonymous session by subject and subcategory", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/test/session?subjectId=language&subcategoryId=english",
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      session: SESSION_RESPONSE,
    });
    expect(readTestSessionByContext).toHaveBeenCalledWith({
      anonymousSessionId: "anon-1",
      subjectId: "language",
      subcategoryId: "english",
    });
    expect(readTestSession).not.toHaveBeenCalled();
  });
});

describe("test session route POST", () => {
  beforeEach(() => {
    persistAnonymousTestSessionCookie.mockReset();
    readAuthenticatedUserId.mockReset();
    readAnonymousTestSessionCookie.mockReset();
    upsertTestSession.mockReset();

    readAuthenticatedUserId.mockResolvedValue(null);
    readAnonymousTestSessionCookie.mockResolvedValue("anon-1");
    upsertTestSession.mockResolvedValue(STORED_SESSION);
  });

  it("upserts authenticated session by subject and subcategory", async () => {
    readAuthenticatedUserId.mockResolvedValueOnce("user-1");

    const response = await POST(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify(VALID_PARAMS),
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      session: SESSION_RESPONSE,
    });
    expect(upsertTestSession).toHaveBeenCalledWith(
      {
        userId: "user-1",
        subjectId: VALID_PARAMS.subjectId,
        subcategoryId: VALID_PARAMS.subcategoryId,
      },
      expect.any(String),
      VALID_PARAMS,
    );
    expect(persistAnonymousTestSessionCookie).not.toHaveBeenCalled();
  });

  it("upserts anonymous session by anonymousSessionId only", async () => {
    const response = await POST(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify(VALID_PARAMS),
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      session: SESSION_RESPONSE,
    });
    expect(upsertTestSession).toHaveBeenCalledWith(
      {
        anonymousSessionId: "anon-1",
      },
      expect.any(String),
      VALID_PARAMS,
    );
    expect(persistAnonymousTestSessionCookie).toHaveBeenCalledWith(
      expect.any(Response),
      "anon-1",
    );
  });

  it("returns 400 for invalid params payload", async () => {
    const response = await POST(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify({ subjectId: "language" }),
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "subjectId, subcategoryId, and difficulty are required.",
    });
    expect(upsertTestSession).not.toHaveBeenCalled();
  });

  it("returns 400 when request body is invalid JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/test/session", {
        body: "not-json",
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid JSON body.",
    });
    expect(upsertTestSession).not.toHaveBeenCalled();
  });
});

describe("test session route PATCH", () => {
  const body = {
    isCorrect: true,
    questionId: "question-1",
    sessionId: "session-1",
  };

  beforeEach(() => {
    incrementTestSessionProgress.mockReset();
    readAnonymousTestSessionCookie.mockReset();
    readAuthenticatedUserId.mockReset();
    readTestSession.mockReset();
    updateTestSessionDifficultyByRecentAccuracy.mockReset();

    incrementTestSessionProgress.mockResolvedValue(1);
    readAuthenticatedUserId.mockResolvedValue(null);
    readAnonymousTestSessionCookie.mockResolvedValue("anon-1");
    readTestSession.mockResolvedValue(STORED_SESSION);
    updateTestSessionDifficultyByRecentAccuracy.mockResolvedValue(STORED_SESSION);
  });

  it("increments authenticated test session progress", async () => {
    readAuthenticatedUserId.mockResolvedValue("user-1");

    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify(body),
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      session: SESSION_RESPONSE,
    });
    expect(incrementTestSessionProgress).toHaveBeenCalledWith(
      { id: "session-1", userId: "user-1" },
      true,
    );
    expect(updateTestSessionDifficultyByRecentAccuracy).toHaveBeenCalledWith(
      { id: "session-1", userId: "user-1" },
      true,
      "question-1",
    );
    expect(readAnonymousTestSessionCookie).not.toHaveBeenCalled();
    expect(readTestSession).not.toHaveBeenCalled();
  });

  it("returns 404 for authenticated session id misses", async () => {
    readAuthenticatedUserId.mockResolvedValue("user-1");
    incrementTestSessionProgress.mockResolvedValueOnce(0);

    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify(body),
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Test session not found.",
    });
  });

  it("returns 400 for authenticated requests without boolean isCorrect", async () => {
    readAuthenticatedUserId.mockResolvedValue("user-1");

    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify({ sessionId: "session-1" }),
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "isCorrect must be a boolean.",
    });
    expect(incrementTestSessionProgress).not.toHaveBeenCalled();
  });

  it("returns 400 when sessionId is missing", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify({ isCorrect: true }),
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "sessionId must be a non-empty string.",
    });
    expect(incrementTestSessionProgress).not.toHaveBeenCalled();
  });

  it("returns 400 when questionId is missing", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify({ isCorrect: true, sessionId: "session-1" }),
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "questionId must be a non-empty string.",
    });
    expect(incrementTestSessionProgress).not.toHaveBeenCalled();
  });

  it("increments anonymous test session progress when session exists", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify({
          isCorrect: false,
          questionId: "question-1",
          sessionId: "session-1",
        }),
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      session: SESSION_RESPONSE,
    });
    expect(incrementTestSessionProgress).toHaveBeenCalledWith(
      { anonymousSessionId: "anon-1", id: "session-1" },
      false,
      MAX_ANONYMOUS_QUESTION_COUNT,
    );
    expect(updateTestSessionDifficultyByRecentAccuracy).toHaveBeenCalledWith(
      { anonymousSessionId: "anon-1", id: "session-1" },
      false,
      "question-1",
    );
    expect(readTestSession).not.toHaveBeenCalled();
  });

  it("returns 404 when anonymous session is missing", async () => {
    readAnonymousTestSessionCookie.mockResolvedValueOnce(null);

    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify(body),
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Anonymous test session not found.",
    });
    expect(incrementTestSessionProgress).not.toHaveBeenCalled();
    expect(readTestSession).not.toHaveBeenCalled();
  });

  it("returns 404 when anonymous session row is missing", async () => {
    incrementTestSessionProgress.mockResolvedValueOnce(0);
    readTestSession.mockResolvedValueOnce(null);

    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify(body),
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Anonymous test session not found.",
    });
    expect(incrementTestSessionProgress).toHaveBeenCalledWith(
      { anonymousSessionId: "anon-1", id: "session-1" },
      true,
      MAX_ANONYMOUS_QUESTION_COUNT,
    );
    expect(readTestSession).toHaveBeenCalledWith({
      id: "session-1",
      anonymousSessionId: "anon-1",
    });
  });

  it("returns 403 when anonymous submission reaches limit", async () => {
    incrementTestSessionProgress.mockResolvedValueOnce(0);
    readTestSession.mockResolvedValueOnce({
      ...STORED_SESSION,
      correctCount: 2,
      submittedCount: MAX_ANONYMOUS_QUESTION_COUNT,
    });

    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify(body),
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: `You have reached the anonymous limit of ${MAX_ANONYMOUS_QUESTION_COUNT} questions. Please log in to continue.`,
    });
    expect(incrementTestSessionProgress).toHaveBeenCalledWith(
      { anonymousSessionId: "anon-1", id: "session-1" },
      true,
      MAX_ANONYMOUS_QUESTION_COUNT,
    );
    expect(readTestSession).toHaveBeenCalledWith({
      id: "session-1",
      anonymousSessionId: "anon-1",
    });
  });

  it("returns 400 when request body is not valid JSON", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: "not-json",
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid JSON body.",
    });
    expect(incrementTestSessionProgress).not.toHaveBeenCalled();
  });
});
