import { API_PATHS } from "@/lib/config/paths";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  clearLocalTestSessionRaw,
  readLocalTestSessionRaw,
  writeLocalTestSessionRaw,
} = vi.hoisted(() => ({
  clearLocalTestSessionRaw: vi.fn(),
  readLocalTestSessionRaw: vi.fn(),
  writeLocalTestSessionRaw: vi.fn(),
}));

vi.mock("@/lib/testSession/adapters/browser/localStorage", () => ({
  clearLocalTestSessionRaw,
  readLocalTestSessionRaw,
  writeLocalTestSessionRaw,
}));

import {
  clearTestSession,
  recordQuestionResult,
  readTestSession,
  writeTestSession,
} from "./storage";

const REMOTE_SESSION_PAYLOAD = {
  session: {
    correctCount: 0,
    difficulty: "A1",
    id: "session-1",
    subjectId: "language",
    subcategoryId: "english",
    submittedCount: 0,
  },
} as const;

describe("session storage", () => {
  beforeEach(() => {
    clearLocalTestSessionRaw.mockReset();
    readLocalTestSessionRaw.mockReset();
    writeLocalTestSessionRaw.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("clearTestSession wipes local and remote", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 204 }),
    );

    await expect(clearTestSession()).resolves.toBeUndefined();
    expect(clearLocalTestSessionRaw).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      API_PATHS.TEST_SESSION,
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("writeTestSession posts and does not write local snapshot", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(REMOTE_SESSION_PAYLOAD), { status: 200 }),
    );

    await expect(
      writeTestSession({
        difficulty: "A1",
        subjectId: "language",
        subcategoryId: "english",
      }),
    ).resolves.toBeUndefined();

    expect(fetchSpy).toHaveBeenCalledWith(
      API_PATHS.TEST_SESSION,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          difficulty: "A1",
          subjectId: "language",
          subcategoryId: "english",
        }),
        headers: { "content-type": "application/json" },
      }),
    );
    expect(writeLocalTestSessionRaw).not.toHaveBeenCalled();
    expect(readLocalTestSessionRaw).not.toHaveBeenCalled();
  });

  it("reads session by context without local-storage dependency", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(REMOTE_SESSION_PAYLOAD), { status: 200 }),
    );

    await expect(
      readTestSession({
        subjectId: "language",
        subcategoryId: "english",
      }),
    ).resolves.toEqual(REMOTE_SESSION_PAYLOAD.session);

    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_PATHS.TEST_SESSION}?subjectId=language&subcategoryId=english`,
      expect.objectContaining({ cache: "no-store", method: "GET" }),
    );
    expect(readLocalTestSessionRaw).not.toHaveBeenCalled();
    expect(writeLocalTestSessionRaw).not.toHaveBeenCalled();
  });

  it("recordQuestionResult sends sessionId and isCorrect payload to session PATCH", async () => {
    const updatedSession = {
      ...REMOTE_SESSION_PAYLOAD.session,
      difficulty: "A2",
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true, session: updatedSession }), { status: 200 }),
    );

    await expect(recordQuestionResult("session-1", true)).resolves.toEqual(updatedSession);

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
