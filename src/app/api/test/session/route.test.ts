import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_ANONYMOUS_QUESTION_COUNT } from "@/lib/config/testPolicy";

const {
  incrementTestSessionProgress,
  readAnonymousTestSessionCookie,
  readAuthenticatedUserId,
  readTestSession,
} = vi.hoisted(() => ({
  incrementTestSessionProgress: vi.fn(),
  readAnonymousTestSessionCookie: vi.fn(),
  readAuthenticatedUserId: vi.fn(),
  readTestSession: vi.fn(),
}));

vi.mock("./auth", () => ({
  readAuthenticatedUserId,
}));

vi.mock("./cookie/anonymous", () => ({
  clearAnonymousTestSessionCookie: vi.fn((response: Response) => response),
  persistAnonymousTestSessionCookie: vi.fn((response: Response) => response),
  readAnonymousTestSessionCookie,
}));

vi.mock("./repo/testSession", () => ({
  deleteTestSession: vi.fn(),
  incrementTestSessionProgress,
  readTestSession,
  upsertTestSession: vi.fn(),
}));

import { PATCH } from "./route";

describe("test session route PATCH", () => {
  beforeEach(() => {
    incrementTestSessionProgress.mockReset();
    readAnonymousTestSessionCookie.mockReset();
    readAuthenticatedUserId.mockReset();
    readTestSession.mockReset();

    readAuthenticatedUserId.mockResolvedValue(null);
    readAnonymousTestSessionCookie.mockResolvedValue("anon-1");
    readTestSession.mockResolvedValue({
      id: "session-1",
      correctCount: 0,
      difficulty: "beginner",
      goal: "study",
      startedAt: new Date("2026-02-12T09:00:00.000Z"),
      submittedCount: 0,
      subjectId: "language",
      subcategoryId: "english",
    });
  });

  it("does not apply anonymous limit for authenticated users", async () => {
    readAuthenticatedUserId.mockResolvedValue("user-1");

    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify({ isCorrect: true }),
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(incrementTestSessionProgress).toHaveBeenCalledWith(
      { userId: "user-1" },
      true,
    );
    expect(readAnonymousTestSessionCookie).not.toHaveBeenCalled();
    expect(readTestSession).not.toHaveBeenCalled();
  });

  it("returns 400 for authenticated requests without boolean isCorrect", async () => {
    readAuthenticatedUserId.mockResolvedValue("user-1");

    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify({}),
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "isCorrect must be a boolean.",
    });
    expect(incrementTestSessionProgress).not.toHaveBeenCalled();
  });

  it("increments anonymous test session progress when session exists", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify({ isCorrect: false }),
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(incrementTestSessionProgress).toHaveBeenCalledWith(
      { anonymousSessionId: "anon-1" },
      false,
    );
    expect(readTestSession).toHaveBeenCalledWith({
      anonymousSessionId: "anon-1",
    });
  });

  it("returns 404 when anonymous session is missing", async () => {
    readAnonymousTestSessionCookie.mockResolvedValueOnce(null);

    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify({ isCorrect: true }),
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
    readTestSession.mockResolvedValueOnce(null);

    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify({ isCorrect: true }),
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Anonymous test session not found.",
    });
    expect(incrementTestSessionProgress).not.toHaveBeenCalled();
  });

  it("returns 403 when anonymous submission reaches limit", async () => {
    readTestSession.mockResolvedValueOnce({
      id: "session-1",
      correctCount: 2,
      difficulty: "beginner",
      goal: "study",
      startedAt: new Date("2026-02-12T09:00:00.000Z"),
      submittedCount: MAX_ANONYMOUS_QUESTION_COUNT,
      subjectId: "language",
      subcategoryId: "english",
    });

    const response = await PATCH(
      new Request("http://localhost/api/test/session", {
        body: JSON.stringify({ isCorrect: true }),
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: `You have reached the anonymous limit of ${MAX_ANONYMOUS_QUESTION_COUNT} questions. Please log in to continue.`,
    });
    expect(incrementTestSessionProgress).not.toHaveBeenCalled();
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
