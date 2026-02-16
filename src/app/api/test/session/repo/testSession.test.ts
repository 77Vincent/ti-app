import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  anonymousTestSessionDeleteMany,
  anonymousTestSessionFindUnique,
  anonymousTestSessionUpdateMany,
  anonymousTestSessionUpsert,
  testSessionQuestionPoolDeleteMany,
  testSessionDeleteMany,
  testSessionFindUnique,
  testSessionUpdateMany,
  testSessionUpsert,
} =
  vi.hoisted(() => ({
    anonymousTestSessionDeleteMany: vi.fn(),
    anonymousTestSessionFindUnique: vi.fn(),
    anonymousTestSessionUpdateMany: vi.fn(),
    anonymousTestSessionUpsert: vi.fn(),
    testSessionQuestionPoolDeleteMany: vi.fn(),
    testSessionDeleteMany: vi.fn(),
    testSessionFindUnique: vi.fn(),
    testSessionUpdateMany: vi.fn(),
    testSessionUpsert: vi.fn(),
  }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    anonymousTestSession: {
      deleteMany: anonymousTestSessionDeleteMany,
      findUnique: anonymousTestSessionFindUnique,
      updateMany: anonymousTestSessionUpdateMany,
      upsert: anonymousTestSessionUpsert,
    },
    testSessionQuestionPool: {
      deleteMany: testSessionQuestionPoolDeleteMany,
    },
    testSession: {
      deleteMany: testSessionDeleteMany,
      findUnique: testSessionFindUnique,
      updateMany: testSessionUpdateMany,
      upsert: testSessionUpsert,
    },
  },
}));

import {
  deleteTestSession,
  incrementTestSessionProgress,
  isTestSessionActive,
  readTestSession,
  upsertTestSession,
} from "./testSession";

describe("test session repo", () => {
  beforeEach(() => {
    anonymousTestSessionDeleteMany.mockReset();
    anonymousTestSessionFindUnique.mockReset();
    anonymousTestSessionUpdateMany.mockReset();
    anonymousTestSessionUpsert.mockReset();
    testSessionQuestionPoolDeleteMany.mockReset();
    testSessionDeleteMany.mockReset();
    testSessionFindUnique.mockReset();
    testSessionUpdateMany.mockReset();
    testSessionUpsert.mockReset();
  });

  it("reads a stored test session payload", async () => {
    testSessionFindUnique.mockResolvedValueOnce({
      id: "session-1",
      correctCount: 3,
      difficulty: "beginner",
      goal: "study",
      startedAt: new Date("2026-02-11T09:00:00.000Z"),
      submittedCount: 5,
      subjectId: "language",
      subcategoryId: "english",
    });

    await expect(readTestSession({ userId: "user-1" })).resolves.toEqual({
      id: "session-1",
      correctCount: 3,
      difficulty: "beginner",
      goal: "study",
      startedAt: new Date("2026-02-11T09:00:00.000Z"),
      submittedCount: 5,
      subjectId: "language",
      subcategoryId: "english",
    });

    expect(testSessionFindUnique).toHaveBeenCalledWith({
      select: {
        id: true,
        correctCount: true,
        difficulty: true,
        goal: true,
        startedAt: true,
        submittedCount: true,
        subjectId: true,
        subcategoryId: true,
      },
      where: {
        userId: "user-1",
      },
    });
  });

  it("reads a stored anonymous test session payload", async () => {
    anonymousTestSessionFindUnique.mockResolvedValueOnce({
      id: "anon-session-1",
      correctCount: 2,
      difficulty: "advanced",
      goal: "exam",
      startedAt: new Date("2026-02-12T09:00:00.000Z"),
      submittedCount: 4,
      subjectId: "language",
      subcategoryId: "japanese",
    });

    await expect(
      readTestSession({ anonymousSessionId: "anon-1" }),
    ).resolves.toEqual({
      id: "anon-session-1",
      correctCount: 2,
      difficulty: "advanced",
      goal: "exam",
      startedAt: new Date("2026-02-12T09:00:00.000Z"),
      submittedCount: 4,
      subjectId: "language",
      subcategoryId: "japanese",
    });

    expect(anonymousTestSessionFindUnique).toHaveBeenCalledWith({
      select: {
        id: true,
        correctCount: true,
        difficulty: true,
        goal: true,
        startedAt: true,
        submittedCount: true,
        subjectId: true,
        subcategoryId: true,
      },
      where: {
        anonymousSessionId: "anon-1",
      },
    });
  });

  it("returns true when auth test session id exists", async () => {
    testSessionFindUnique.mockResolvedValueOnce({ id: "session-1" });
    anonymousTestSessionFindUnique.mockResolvedValueOnce(null);

    await expect(isTestSessionActive("session-1")).resolves.toBe(true);

    expect(testSessionFindUnique).toHaveBeenCalledWith({
      where: {
        id: "session-1",
      },
      select: {
        id: true,
      },
    });
    expect(anonymousTestSessionFindUnique).toHaveBeenCalledWith({
      where: {
        id: "session-1",
      },
      select: {
        id: true,
      },
    });
  });

  it("returns true when anonymous test session id exists", async () => {
    testSessionFindUnique.mockResolvedValueOnce(null);
    anonymousTestSessionFindUnique.mockResolvedValueOnce({
      id: "anon-session-1",
    });

    await expect(isTestSessionActive("anon-session-1")).resolves.toBe(true);
  });

  it("returns false when test session id does not exist", async () => {
    testSessionFindUnique.mockResolvedValueOnce(null);
    anonymousTestSessionFindUnique.mockResolvedValueOnce(null);

    await expect(isTestSessionActive("missing-session")).resolves.toBe(false);
  });

  it("upserts user-owned test session", async () => {
    testSessionUpsert.mockResolvedValueOnce(undefined);
    testSessionFindUnique.mockResolvedValueOnce(null);
    const startedAt = new Date("2025-02-12T08:00:00.000Z");

    await upsertTestSession(
      { userId: "user-1" },
      "session-1",
      {
        difficulty: "beginner",
        goal: "study",
        subjectId: "language",
        subcategoryId: "english",
      },
      startedAt,
    );

    expect(testSessionUpsert).toHaveBeenCalledWith({
      create: {
        id: "session-1",
        correctCount: 0,
        difficulty: "beginner",
        goal: "study",
        startedAt,
        submittedCount: 0,
        subjectId: "language",
        subcategoryId: "english",
        userId: "user-1",
      },
      update: {
        correctCount: 0,
        id: "session-1",
        difficulty: "beginner",
        goal: "study",
        startedAt,
        submittedCount: 0,
        subjectId: "language",
        subcategoryId: "english",
      },
      where: {
        userId: "user-1",
      },
    });
  });

  it("upserts anonymous test session", async () => {
    anonymousTestSessionUpsert.mockResolvedValueOnce(undefined);
    anonymousTestSessionFindUnique.mockResolvedValueOnce(null);
    const startedAt = new Date("2026-02-12T08:00:00.000Z");

    await upsertTestSession(
      { anonymousSessionId: "anon-1" },
      "anon-session-1",
      {
        difficulty: "beginner",
        goal: "study",
        subjectId: "language",
        subcategoryId: "english",
      },
      startedAt,
    );

    expect(anonymousTestSessionUpsert).toHaveBeenCalledWith({
      create: {
        id: "anon-session-1",
        anonymousSessionId: "anon-1",
        correctCount: 0,
        difficulty: "beginner",
        goal: "study",
        startedAt,
        submittedCount: 0,
        subjectId: "language",
        subcategoryId: "english",
      },
      update: {
        id: "anon-session-1",
        difficulty: "beginner",
        goal: "study",
        startedAt,
        subjectId: "language",
        subcategoryId: "english",
      },
      where: {
        anonymousSessionId: "anon-1",
      },
    });
  });

  it("increments submission count for incorrect answer", async () => {
    testSessionUpdateMany.mockResolvedValueOnce({ count: 1 });

    await incrementTestSessionProgress({ userId: "user-1" }, false);

    expect(testSessionUpdateMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
      },
      data: {
        submittedCount: {
          increment: 1,
        },
      },
    });
  });

  it("increments anonymous submission count for incorrect answer", async () => {
    anonymousTestSessionUpdateMany.mockResolvedValueOnce({ count: 1 });

    await incrementTestSessionProgress({ anonymousSessionId: "anon-1" }, false);

    expect(anonymousTestSessionUpdateMany).toHaveBeenCalledWith({
      where: {
        anonymousSessionId: "anon-1",
      },
      data: {
        submittedCount: {
          increment: 1,
        },
      },
    });
  });

  it("increments submission and correct counts for correct answer", async () => {
    testSessionUpdateMany.mockResolvedValueOnce({ count: 1 });

    await incrementTestSessionProgress({ userId: "user-1" }, true);

    expect(testSessionUpdateMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
      },
      data: {
        submittedCount: {
          increment: 1,
        },
        correctCount: {
          increment: 1,
        },
      },
    });
  });

  it("increments anonymous submission and correct counts for correct answer", async () => {
    anonymousTestSessionUpdateMany.mockResolvedValueOnce({ count: 1 });

    await incrementTestSessionProgress({ anonymousSessionId: "anon-1" }, true);

    expect(anonymousTestSessionUpdateMany).toHaveBeenCalledWith({
      where: {
        anonymousSessionId: "anon-1",
      },
      data: {
        submittedCount: {
          increment: 1,
        },
        correctCount: {
          increment: 1,
        },
      },
    });
  });

  it("deletes by identity selector", async () => {
    testSessionFindUnique.mockResolvedValueOnce({
      id: "session-1",
    });
    testSessionQuestionPoolDeleteMany.mockResolvedValueOnce({ count: 2 });
    testSessionDeleteMany.mockResolvedValueOnce({ count: 1 });

    await deleteTestSession({ userId: "user-1" });

    expect(testSessionQuestionPoolDeleteMany).toHaveBeenCalledWith({
      where: {
        sessionId: "session-1",
      },
    });

    expect(testSessionDeleteMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
      },
    });
  });

  it("deletes anonymous session by identity selector", async () => {
    anonymousTestSessionFindUnique.mockResolvedValueOnce({
      id: "anon-session-1",
    });
    testSessionQuestionPoolDeleteMany.mockResolvedValueOnce({ count: 2 });
    anonymousTestSessionDeleteMany.mockResolvedValueOnce({ count: 1 });

    await deleteTestSession({ anonymousSessionId: "anon-1" });

    expect(testSessionQuestionPoolDeleteMany).toHaveBeenCalledWith({
      where: {
        sessionId: "anon-session-1",
      },
    });

    expect(anonymousTestSessionDeleteMany).toHaveBeenCalledWith({
      where: {
        anonymousSessionId: "anon-1",
      },
    });
  });
});
