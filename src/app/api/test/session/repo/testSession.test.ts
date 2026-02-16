import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  testSessionDeleteMany,
  testSessionFindUnique,
  testSessionQuestionPoolDeleteMany,
  testSessionUpdateMany,
  testSessionUpsert,
} =
  vi.hoisted(() => ({
    testSessionDeleteMany: vi.fn(),
    testSessionFindUnique: vi.fn(),
    testSessionQuestionPoolDeleteMany: vi.fn(),
    testSessionUpdateMany: vi.fn(),
    testSessionUpsert: vi.fn(),
  }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
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
  readTestSession,
  upsertTestSession,
} from "./testSession";

describe("test session repo", () => {
  beforeEach(() => {
    testSessionDeleteMany.mockReset();
    testSessionFindUnique.mockReset();
    testSessionQuestionPoolDeleteMany.mockReset();
    testSessionUpdateMany.mockReset();
    testSessionUpsert.mockReset();
  });

  it("reads a stored user test session payload", async () => {
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
    testSessionFindUnique.mockResolvedValueOnce({
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
        anonymousSessionId: "anon-1",
      },
    });
  });

  it("upserts user-owned test session", async () => {
    testSessionFindUnique.mockResolvedValueOnce(null);
    testSessionUpsert.mockResolvedValueOnce(undefined);
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
    testSessionFindUnique.mockResolvedValueOnce(null);
    testSessionUpsert.mockResolvedValueOnce(undefined);
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

    expect(testSessionUpsert).toHaveBeenCalledWith({
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
        correctCount: 0,
        id: "anon-session-1",
        difficulty: "beginner",
        goal: "study",
        startedAt,
        submittedCount: 0,
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

  it("increments anonymous submission and correct counts for correct answer", async () => {
    testSessionUpdateMany.mockResolvedValueOnce({ count: 1 });

    await incrementTestSessionProgress({ anonymousSessionId: "anon-1" }, true);

    expect(testSessionUpdateMany).toHaveBeenCalledWith({
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

  it("deletes user session by identity selector", async () => {
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
    testSessionFindUnique.mockResolvedValueOnce({
      id: "anon-session-1",
    });
    testSessionQuestionPoolDeleteMany.mockResolvedValueOnce({ count: 2 });
    testSessionDeleteMany.mockResolvedValueOnce({ count: 1 });

    await deleteTestSession({ anonymousSessionId: "anon-1" });

    expect(testSessionQuestionPoolDeleteMany).toHaveBeenCalledWith({
      where: {
        sessionId: "anon-session-1",
      },
    });

    expect(testSessionDeleteMany).toHaveBeenCalledWith({
      where: {
        anonymousSessionId: "anon-1",
      },
    });
  });
});
