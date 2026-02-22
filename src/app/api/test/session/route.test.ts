import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_ANONYMOUS_QUESTION_COUNT } from "@/lib/config/testPolicy";

const {
  clearAnonymousTestSessionCookie,
  deleteTestSession,
  incrementTestSessionProgress,
  persistAnonymousTestSessionCookie,
  readAnonymousTestSessionCookie,
  readAuthenticatedUserId,
  readTestSession,
  upsertTestSession,
} = vi.hoisted(() => ({
  clearAnonymousTestSessionCookie: vi.fn((response: Response) => response),
  deleteTestSession: vi.fn(),
  incrementTestSessionProgress: vi.fn(),
  persistAnonymousTestSessionCookie: vi.fn((response: Response) => response),
  readAnonymousTestSessionCookie: vi.fn(),
  readAuthenticatedUserId: vi.fn(),
  readTestSession: vi.fn(),
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
  readTestSession,
  upsertTestSession,
}));

import { GET, PATCH, POST } from "./route";

const STORED_SESSION = {
  id: "session-1",
  correctCount: 0,
  difficulty: "A1",
  startedAt: new Date("2026-02-12T09:00:00.000Z"),
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
  startedAtMs: STORED_SESSION.startedAt.getTime(),
} as const;

describe("test session route GET", () => {
  beforeEach(() => {
    readAuthenticatedUserId.mockReset();
    readAnonymousTestSessionCookie.mockReset();
    readTestSession.mockReset();

    readAuthenticatedUserId.mockResolvedValue(null);
    readAnonymousTestSessionCookie.mockResolvedValue("anon-1");
    readTestSession.mockResolvedValue(STORED_SESSION);
  });

  it("returns null when sessionId query param is missing", async () => {
    const response = await GET(
      new Request("http://localhost/api/test/session"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ session: null });
    expect(readTestSession).not.toHaveBeenCalled();
  });

  it("reads authenticated session by id", async () => {
    readAuthenticatedUserId.mockResolvedValueOnce("user-1");

    const response = await GET(
      new Request("http://localhost/api/test/session?sessionId=session-1"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      session: SESSION_RESPONSE,
    });
    expect(readTestSession).toHaveBeenCalledWith({
      id: "session-1",
      userId: "user-1",
    });
    expect(readAnonymousTestSessionCookie).not.toHaveBeenCalled();
  });

  it("reads anonymous session by id", async () => {
    const response = await GET(
      new Request("http://localhost/api/test/session?sessionId=session-1"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      session: SESSION_RESPONSE,
    });
    expect(readTestSession).toHaveBeenCalledWith({
      id: "session-1",
      anonymousSessionId: "anon-1",
    });
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
      expect.any(Date),
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
      expect.any(Date),
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
    sessionId: "session-1",
  };

  beforeEach(() => {
    incrementTestSessionProgress.mockReset();
    readAnonymousTestSessionCookie.mockReset();
    readAuthenticatedUserId.mockReset();
    readTestSession.mockReset();

    incrementTestSessionProgress.mockResolvedValue(1);
    readAuthenticatedUserId.mockResolvedValue(null);
    readAnonymousTestSessionCookie.mockResolvedValue("anon-1");
    readTestSession.mockResolvedValue(STORED_SESSION);
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
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(incrementTestSessionProgress).toHaveBeenCalledWith(
      { id: "session-1", userId: "user-1" },
      true,
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

  it("increments anonymous test session progress when session exists", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify({ isCorrect: false, sessionId: "session-1" }),
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(incrementTestSessionProgress).toHaveBeenCalledWith(
      { anonymousSessionId: "anon-1", id: "session-1" },
      false,
      MAX_ANONYMOUS_QUESTION_COUNT,
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
