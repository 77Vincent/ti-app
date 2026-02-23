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

  it("returns remote session when local snapshot matches id", async () => {
    readLocalTestSessionRaw.mockReturnValue(
      JSON.stringify({ sessionId: "session-1" }),
    );

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(REMOTE_SESSION_PAYLOAD), { status: 200 }),
    );

    await expect(readTestSession()).resolves.toEqual(REMOTE_SESSION_PAYLOAD.session);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(clearLocalTestSessionRaw).not.toHaveBeenCalled();
    expect(writeLocalTestSessionRaw).not.toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_PATHS.TEST_SESSION}?sessionId=session-1`,
      expect.objectContaining({ cache: "no-store", method: "GET" }),
    );
  });

  it("returns null without remote call when local snapshot is missing", async () => {
    readLocalTestSessionRaw.mockReturnValue(null);

    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(readTestSession()).resolves.toBeNull();
    expect(clearLocalTestSessionRaw).toHaveBeenCalledTimes(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("clears local session when remote id mismatches", async () => {
    readLocalTestSessionRaw.mockReturnValue(
      JSON.stringify({ sessionId: "session-1" }),
    );

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
    expect(clearLocalTestSessionRaw).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("clears local session when remote session is absent", async () => {
    readLocalTestSessionRaw.mockReturnValue(
      JSON.stringify({ sessionId: "session-1" }),
    );

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 204 }),
    );

    await expect(readTestSession()).resolves.toBeNull();
    expect(clearLocalTestSessionRaw).toHaveBeenCalledTimes(1);
    expect(readLocalTestSessionRaw).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
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

  it("writeTestSession persists session id snapshot", async () => {
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

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(writeLocalTestSessionRaw).toHaveBeenCalledWith(
      JSON.stringify({ sessionId: "session-1" }),
    );
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
