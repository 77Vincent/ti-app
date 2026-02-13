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

vi.mock("./local", () => ({
  clearLocalTestSession,
  readLocalTestSessionSnapshot,
  writeLocalTestSession,
}));

import { clearTestSession, readTestSession } from "./storage";

const REMOTE_SESSION_PAYLOAD = {
  session: {
    id: "session-1",
    subjectId: "language",
    subcategoryId: "english",
    difficulty: "beginner",
    goal: "study",
    startedAtMs: 1739395200000,
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
      currentQuestionIndex: 0,
      questions: [],
      sessionId: "session-1",
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(REMOTE_SESSION_PAYLOAD), { status: 200 }),
    );

    await expect(readTestSession()).resolves.toEqual(REMOTE_SESSION_PAYLOAD.session);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(clearLocalTestSession).not.toHaveBeenCalled();
    expect(writeLocalTestSession).not.toHaveBeenCalled();
  });

  it("wipes local and remote session when local snapshot is missing", async () => {
    readLocalTestSessionSnapshot.mockReturnValue(null);

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(REMOTE_SESSION_PAYLOAD), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(readTestSession()).resolves.toBeNull();
    expect(clearLocalTestSession).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      API_PATHS.TEST_SESSION,
      expect.objectContaining({ cache: "no-store", method: "GET" }),
    );
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      API_PATHS.TEST_SESSION,
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("wipes local and remote session when local snapshot id mismatches", async () => {
    readLocalTestSessionSnapshot.mockReturnValue({
      currentQuestionIndex: 0,
      questions: [],
      sessionId: "session-other",
    });

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(REMOTE_SESSION_PAYLOAD), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(readTestSession()).resolves.toBeNull();
    expect(clearLocalTestSession).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("clears local session when remote session is absent", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 204 }),
    );

    await expect(readTestSession()).resolves.toBeNull();
    expect(clearLocalTestSession).toHaveBeenCalledTimes(1);
    expect(readLocalTestSessionSnapshot).not.toHaveBeenCalled();
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
});
