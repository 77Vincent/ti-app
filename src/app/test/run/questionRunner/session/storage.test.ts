import { API_PATHS } from "@/lib/config/paths";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  clearLocalTestSession,
  readLocalTestSessionSnapshot,
  writeLocalTestSession,
} = vi.hoisted(() => ({
  clearLocalTestSession: vi.fn(),
  readLocalTestSessionSnapshot: vi.fn(),
  writeLocalTestSession: vi.fn(),
}));

vi.mock("@/lib/testSession/service/browserLocalSession", () => ({
  localTestSessionService: {
    clearLocalTestSession,
    readLocalTestSessionSnapshot,
    writeLocalTestSession,
  },
}));

import { clearTestSession, recordQuestionResult, readTestSession } from "./storage";

const REMOTE_SESSION_PAYLOAD = {
  session: {
    correctCount: 0,
    id: "session-1",
    subjectId: "language",
    subcategoryId: "english",
    difficulty: "beginner",
    startedAtMs: 1739395200000,
    submittedCount: 0,
  },
} as const;

describe("session storage", () => {
  beforeEach(() => {
    clearLocalTestSession.mockReset();
    readLocalTestSessionSnapshot.mockReset();
    writeLocalTestSession.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns remote session when local snapshot matches id", async () => {
    readLocalTestSessionSnapshot.mockReturnValue({
      sessionId: "session-1",
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(REMOTE_SESSION_PAYLOAD), { status: 200 }),
    );

    await expect(readTestSession()).resolves.toEqual(REMOTE_SESSION_PAYLOAD.session);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(clearLocalTestSession).not.toHaveBeenCalled();
    expect(writeLocalTestSession).not.toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_PATHS.TEST_SESSION}?sessionId=session-1`,
      expect.objectContaining({ cache: "no-store", method: "GET" }),
    );
  });

  it("returns null without remote call when local snapshot is missing", async () => {
    readLocalTestSessionSnapshot.mockReturnValue(null);

    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(readTestSession()).resolves.toBeNull();
    expect(clearLocalTestSession).toHaveBeenCalledTimes(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("clears local session when remote id mismatches", async () => {
    readLocalTestSessionSnapshot.mockReturnValue({
      sessionId: "session-1",
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          session: {
            ...REMOTE_SESSION_PAYLOAD.session,
            id: "session-other",
          },
        }),
        { status: 200 },
      ),
    );

    await expect(readTestSession()).resolves.toBeNull();
    expect(clearLocalTestSession).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("clears local session when remote session is absent", async () => {
    readLocalTestSessionSnapshot.mockReturnValue({
      sessionId: "session-1",
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 204 }),
    );

    await expect(readTestSession()).resolves.toBeNull();
    expect(clearLocalTestSession).toHaveBeenCalledTimes(1);
    expect(readLocalTestSessionSnapshot).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("clearTestSession wipes local and remote", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 204 }),
    );

    await expect(clearTestSession()).resolves.toBeUndefined();
    expect(clearLocalTestSession).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      API_PATHS.TEST_SESSION,
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("recordQuestionResult sends sessionId and isCorrect payload to session PATCH", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await expect(recordQuestionResult("session-1", true)).resolves.toBeUndefined();

    expect(fetchSpy).toHaveBeenCalledWith(
      API_PATHS.TEST_SESSION,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ isCorrect: true, sessionId: "session-1" }),
        headers: { "content-type": "application/json" },
      }),
    );
  });
});
