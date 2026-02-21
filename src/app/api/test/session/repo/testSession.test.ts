import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  testSessionCreate,
  testSessionDeleteMany,
  testSessionFindFirst,
  testSessionUpsert,
  testSessionUpdateMany,
} = vi.hoisted(() => ({
  testSessionCreate: vi.fn(),
  testSessionDeleteMany: vi.fn(),
  testSessionFindFirst: vi.fn(),
  testSessionUpsert: vi.fn(),
  testSessionUpdateMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    testSession: {
      create: testSessionCreate,
      deleteMany: testSessionDeleteMany,
      findFirst: testSessionFindFirst,
      upsert: testSessionUpsert,
      updateMany: testSessionUpdateMany,
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
    testSessionCreate.mockReset();
    testSessionDeleteMany.mockReset();
    testSessionFindFirst.mockReset();
    testSessionUpsert.mockReset();
    testSessionUpdateMany.mockReset();
  });

  it("reads a stored user test session payload by id", async () => {
    testSessionFindFirst.mockResolvedValueOnce({
      id: "session-1",
      correctCount: 3,
      difficulty: "beginner",
      startedAt: new Date("2026-02-11T09:00:00.000Z"),
      submittedCount: 5,
      subjectId: "language",
      subcategoryId: "english",
    });

    await expect(
      readTestSession({ id: "session-1", userId: "user-1" }),
    ).resolves.toEqual({
      id: "session-1",
      correctCount: 3,
      difficulty: "beginner",
      startedAt: new Date("2026-02-11T09:00:00.000Z"),
      submittedCount: 5,
      subjectId: "language",
      subcategoryId: "english",
    });

    expect(testSessionFindFirst).toHaveBeenCalledWith({
      select: {
        id: true,
        correctCount: true,
        difficulty: true,
        startedAt: true,
        submittedCount: true,
        subjectId: true,
        subcategoryId: true,
      },
      where: {
        id: "session-1",
        userId: "user-1",
      },
    });
  });

  it("reads a stored anonymous test session payload by id", async () => {
    testSessionFindFirst.mockResolvedValueOnce({
      id: "anon-session-1",
      correctCount: 2,
      difficulty: "advanced",
      startedAt: new Date("2026-02-12T09:00:00.000Z"),
      submittedCount: 4,
      subjectId: "language",
      subcategoryId: "english",
    });

    await expect(
      readTestSession({ id: "anon-session-1", anonymousSessionId: "anon-1" }),
    ).resolves.toEqual({
      id: "anon-session-1",
      correctCount: 2,
      difficulty: "advanced",
      startedAt: new Date("2026-02-12T09:00:00.000Z"),
      submittedCount: 4,
      subjectId: "language",
      subcategoryId: "english",
    });

    expect(testSessionFindFirst).toHaveBeenCalledWith({
      select: {
        id: true,
        correctCount: true,
        difficulty: true,
        startedAt: true,
        submittedCount: true,
        subjectId: true,
        subcategoryId: true,
      },
      where: {
        id: "anon-session-1",
        anonymousSessionId: "anon-1",
      },
    });
  });

  it("resumes existing authenticated session on unique conflict", async () => {
    const existingSession = {
      id: "session-existing",
      correctCount: 4,
      difficulty: "beginner",
      startedAt: new Date("2026-02-10T08:00:00.000Z"),
      submittedCount: 6,
      subjectId: "language",
      subcategoryId: "english",
    };
    testSessionCreate.mockRejectedValueOnce({ code: "P2002" });
    testSessionFindFirst.mockResolvedValueOnce(existingSession);
    const startedAt = new Date("2026-02-12T08:00:00.000Z");

    await expect(
      upsertTestSession(
        {
          userId: "user-1",
          subjectId: "language",
          subcategoryId: "english",
        },
        "session-new",
        {
          difficulty: "beginner",
          subjectId: "language",
          subcategoryId: "english",
        },
        startedAt,
      ),
    ).resolves.toEqual(existingSession);

    expect(testSessionCreate).toHaveBeenCalledWith({
      data: {
        id: "session-new",
        correctCount: 0,
        difficulty: "beginner",
        startedAt,
        submittedCount: 0,
        userId: "user-1",
        subjectId: "language",
        subcategoryId: "english",
      },
      select: {
        id: true,
        correctCount: true,
        difficulty: true,
        startedAt: true,
        submittedCount: true,
        subjectId: true,
        subcategoryId: true,
      },
    });
    expect(testSessionFindFirst).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        subjectId: "language",
        subcategoryId: "english",
      },
      select: {
        id: true,
        correctCount: true,
        difficulty: true,
        startedAt: true,
        submittedCount: true,
        subjectId: true,
        subcategoryId: true,
      },
    });
    expect(testSessionUpsert).not.toHaveBeenCalled();
  });

  it("creates authenticated session when context does not exist", async () => {
    const startedAt = new Date("2026-02-12T08:00:00.000Z");
    const createdSession = {
      id: "session-new",
      correctCount: 0,
      difficulty: "beginner",
      startedAt,
      submittedCount: 0,
      subjectId: "language",
      subcategoryId: "english",
    };
    testSessionCreate.mockResolvedValueOnce(createdSession);

    await expect(
      upsertTestSession(
        {
          userId: "user-1",
          subjectId: "language",
          subcategoryId: "english",
        },
        "session-new",
        {
          difficulty: "beginner",
          subjectId: "language",
          subcategoryId: "english",
        },
        startedAt,
      ),
    ).resolves.toEqual(createdSession);

    expect(testSessionFindFirst).not.toHaveBeenCalled();
    expect(testSessionUpsert).not.toHaveBeenCalled();
  });

  it("upserts a single anonymous session regardless of context", async () => {
    const startedAt = new Date("2026-02-12T08:00:00.000Z");
    testSessionUpsert.mockResolvedValueOnce({
      id: "anon-session-1",
      correctCount: 0,
      difficulty: "beginner",
      startedAt,
      submittedCount: 0,
      subjectId: "language",
      subcategoryId: "english",
    });

    await upsertTestSession(
      {
        anonymousSessionId: "anon-1",
      },
      "anon-session-1",
      {
        difficulty: "beginner",
        subjectId: "language",
        subcategoryId: "english",
      },
      startedAt,
    );

    expect(testSessionUpsert).toHaveBeenCalledWith({
      where: {
        anonymousSessionId: "anon-1",
      },
      create: {
        id: "anon-session-1",
        anonymousSessionId: "anon-1",
        correctCount: 0,
        difficulty: "beginner",
        startedAt,
        submittedCount: 0,
        subjectId: "language",
        subcategoryId: "english",
      },
      update: {
        id: "anon-session-1",
        correctCount: 0,
        difficulty: "beginner",
        startedAt,
        submittedCount: 0,
        subjectId: "language",
        subcategoryId: "english",
      },
      select: {
        id: true,
        correctCount: true,
        difficulty: true,
        startedAt: true,
        submittedCount: true,
        subjectId: true,
        subcategoryId: true,
      },
    });
    expect(testSessionFindFirst).not.toHaveBeenCalled();
  });

  it("increments submission count for incorrect answer", async () => {
    testSessionUpdateMany.mockResolvedValueOnce({ count: 1 });

    await expect(
      incrementTestSessionProgress({ id: "session-1", userId: "user-1" }, false),
    ).resolves.toBe(1);

    expect(testSessionUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "session-1",
        userId: "user-1",
      },
      data: {
        submittedCount: {
          increment: 1,
        },
      },
    });
  });

  it("increments with limit guard for anonymous session", async () => {
    testSessionUpdateMany.mockResolvedValueOnce({ count: 1 });

    await expect(
      incrementTestSessionProgress(
        { id: "session-1", anonymousSessionId: "anon-1" },
        true,
        10,
      ),
    ).resolves.toBe(1);

    expect(testSessionUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "session-1",
        anonymousSessionId: "anon-1",
        submittedCount: {
          lt: 10,
        },
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
    testSessionUpdateMany.mockResolvedValueOnce({ count: 1 });

    await expect(
      incrementTestSessionProgress(
        { id: "session-1", anonymousSessionId: "anon-1" },
        true,
      ),
    ).resolves.toBe(1);

    expect(testSessionUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "session-1",
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

  it("deletes user sessions by identity selector", async () => {
    testSessionDeleteMany.mockResolvedValueOnce({ count: 1 });

    await deleteTestSession({ userId: "user-1" });

    expect(testSessionDeleteMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
      },
    });
  });

  it("deletes anonymous sessions by identity selector", async () => {
    testSessionDeleteMany.mockResolvedValueOnce({ count: 1 });

    await deleteTestSession({ anonymousSessionId: "anon-1" });

    expect(testSessionDeleteMany).toHaveBeenCalledWith({
      where: {
        anonymousSessionId: "anon-1",
      },
    });
  });
});
