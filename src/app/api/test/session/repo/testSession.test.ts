import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  testSessionCreate,
  testSessionDeleteMany,
  testSessionFindFirst,
  testSessionUpdate,
  testSessionUpsert,
  testSessionUpdateMany,
} = vi.hoisted(() => ({
  testSessionCreate: vi.fn(),
  testSessionDeleteMany: vi.fn(),
  testSessionFindFirst: vi.fn(),
  testSessionUpdate: vi.fn(),
  testSessionUpsert: vi.fn(),
  testSessionUpdateMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    testSession: {
      create: testSessionCreate,
      deleteMany: testSessionDeleteMany,
      findFirst: testSessionFindFirst,
      update: testSessionUpdate,
      upsert: testSessionUpsert,
      updateMany: testSessionUpdateMany,
    },
  },
}));

import {
  deleteTestSession,
  incrementTestSessionProgress,
  readTestSessionByContext,
  readTestSession,
  updateTestSessionDifficultyByRecentAccuracy,
  upsertTestSession,
} from "./testSession";
import { DIFFICULTY_LEVEL_CHANGE_COOLDOWN_SUBMISSIONS } from "@/lib/difficulty/config";

describe("test session repo", () => {
  beforeEach(() => {
    testSessionCreate.mockReset();
    testSessionDeleteMany.mockReset();
    testSessionFindFirst.mockReset();
    testSessionUpdate.mockReset();
    testSessionUpsert.mockReset();
    testSessionUpdateMany.mockReset();
  });

  it("reads a stored user test session payload by id", async () => {
    testSessionFindFirst.mockResolvedValueOnce({
      id: "session-1",
      correctCount: 3,
      submittedCount: 5,
      subjectId: "language",
      subcategoryId: "english",
      difficulty: "A1",
    });

    await expect(
      readTestSession({ id: "session-1", userId: "user-1" }),
    ).resolves.toEqual({
      id: "session-1",
      correctCount: 3,
      submittedCount: 5,
      subjectId: "language",
      subcategoryId: "english",
      difficulty: "A1",
    });

    expect(testSessionFindFirst).toHaveBeenCalledWith({
      select: {
        id: true,
        correctCount: true,
        submittedCount: true,
        subjectId: true,
        subcategoryId: true,
        difficulty: true,
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
      submittedCount: 4,
      subjectId: "language",
      subcategoryId: "english",
      difficulty: "A1",
    });

    await expect(
      readTestSession({ id: "anon-session-1", anonymousSessionId: "anon-1" }),
    ).resolves.toEqual({
      id: "anon-session-1",
      correctCount: 2,
      submittedCount: 4,
      subjectId: "language",
      subcategoryId: "english",
      difficulty: "A1",
    });

    expect(testSessionFindFirst).toHaveBeenCalledWith({
      select: {
        id: true,
        correctCount: true,
        submittedCount: true,
        subjectId: true,
        subcategoryId: true,
        difficulty: true,
      },
      where: {
        id: "anon-session-1",
        anonymousSessionId: "anon-1",
      },
    });
  });

  it("reads a stored session payload by subject and subcategory context", async () => {
    testSessionFindFirst.mockResolvedValueOnce({
      id: "session-1",
      correctCount: 2,
      submittedCount: 4,
      subjectId: "language",
      subcategoryId: "english",
      difficulty: "A1",
    });

    await expect(
      readTestSessionByContext({
        userId: "user-1",
        subjectId: "language",
        subcategoryId: "english",
      }),
    ).resolves.toEqual({
      id: "session-1",
      correctCount: 2,
      submittedCount: 4,
      subjectId: "language",
      subcategoryId: "english",
      difficulty: "A1",
    });

    expect(testSessionFindFirst).toHaveBeenCalledWith({
      select: {
        id: true,
        correctCount: true,
        submittedCount: true,
        subjectId: true,
        subcategoryId: true,
        difficulty: true,
      },
      where: {
        userId: "user-1",
        subjectId: "language",
        subcategoryId: "english",
      },
    });
  });

  it("resumes existing authenticated session on unique conflict", async () => {
    const existingSession = {
      id: "session-existing",
      correctCount: 4,
      submittedCount: 6,
      subjectId: "language",
      subcategoryId: "english",
      difficulty: "A1",
    };
    testSessionCreate.mockRejectedValueOnce({ code: "P2002" });
    testSessionFindFirst.mockResolvedValueOnce(existingSession);

    await expect(
      upsertTestSession(
        {
          userId: "user-1",
          subjectId: "language",
          subcategoryId: "english",
        },
        "session-new",
        {
          difficulty: "A1",
          subjectId: "language",
          subcategoryId: "english",
        },
      ),
    ).resolves.toEqual(existingSession);

    expect(testSessionCreate).toHaveBeenCalledWith({
      data: {
        id: "session-new",
        correctCount: 0,
        submittedCount: 0,
        userId: "user-1",
        subjectId: "language",
        subcategoryId: "english",
        difficulty: "A1",
        difficultyCooldownRemaining: 0,
        recentOutcomes: [],
      },
      select: {
        id: true,
        correctCount: true,
        submittedCount: true,
        subjectId: true,
        subcategoryId: true,
        difficulty: true,
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
        submittedCount: true,
        subjectId: true,
        subcategoryId: true,
        difficulty: true,
      },
    });
    expect(testSessionUpsert).not.toHaveBeenCalled();
  });

  it("creates authenticated session when context does not exist", async () => {
    const createdSession = {
      id: "session-new",
      correctCount: 0,
      submittedCount: 0,
      subjectId: "language",
      subcategoryId: "english",
      difficulty: "A1",
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
          difficulty: "A1",
          subjectId: "language",
          subcategoryId: "english",
        },
      ),
    ).resolves.toEqual(createdSession);

    expect(testSessionFindFirst).not.toHaveBeenCalled();
    expect(testSessionUpsert).not.toHaveBeenCalled();
  });

  it("upserts a single anonymous session regardless of context", async () => {
    testSessionUpsert.mockResolvedValueOnce({
      id: "anon-session-1",
      correctCount: 0,
      submittedCount: 0,
      subjectId: "language",
      subcategoryId: "english",
      difficulty: "A1",
    });

    await upsertTestSession(
      {
        anonymousSessionId: "anon-1",
      },
      "anon-session-1",
      {
        difficulty: "A1",
        subjectId: "language",
        subcategoryId: "english",
      },
    );

    expect(testSessionUpsert).toHaveBeenCalledWith({
      where: {
        anonymousSessionId: "anon-1",
      },
      create: {
        id: "anon-session-1",
        anonymousSessionId: "anon-1",
        correctCount: 0,
        submittedCount: 0,
        subjectId: "language",
        subcategoryId: "english",
        difficulty: "A1",
        difficultyCooldownRemaining: 0,
        recentOutcomes: [],
      },
      update: {
        id: "anon-session-1",
        correctCount: 0,
        submittedCount: 0,
        subjectId: "language",
        subcategoryId: "english",
        difficulty: "A1",
        difficultyCooldownRemaining: 0,
        recentOutcomes: [],
      },
      select: {
        id: true,
        correctCount: true,
        submittedCount: true,
        subjectId: true,
        subcategoryId: true,
        difficulty: true,
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

  it("updates adaptive difficulty after submission based on recent outcomes", async () => {
    testSessionFindFirst.mockResolvedValueOnce({
      id: "session-1",
      subcategoryId: "english",
      difficulty: "A1",
      difficultyCooldownRemaining: 0,
      recentOutcomes: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    });
    testSessionUpdate.mockResolvedValueOnce({
      id: "session-1",
      correctCount: 8,
      submittedCount: 9,
      subjectId: "language",
      subcategoryId: "english",
      difficulty: "A2",
    });

    await expect(
      updateTestSessionDifficultyByRecentAccuracy(
        { id: "session-1", userId: "user-1" },
        true,
      ),
    ).resolves.toEqual({
      id: "session-1",
      correctCount: 8,
      submittedCount: 9,
      subjectId: "language",
      subcategoryId: "english",
      difficulty: "A2",
    });

    expect(testSessionFindFirst).toHaveBeenCalledWith({
      where: {
        id: "session-1",
        userId: "user-1",
      },
      select: {
        id: true,
        subcategoryId: true,
        difficulty: true,
        difficultyCooldownRemaining: true,
        recentOutcomes: true,
      },
    });
    expect(testSessionUpdate).toHaveBeenCalledWith({
      where: {
        id: "session-1",
      },
      data: {
        difficulty: "A2",
        difficultyCooldownRemaining:
          DIFFICULTY_LEVEL_CHANGE_COOLDOWN_SUBMISSIONS,
        recentOutcomes: [
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1,
        ],
      },
      select: {
        id: true,
        correctCount: true,
        submittedCount: true,
        subjectId: true,
        subcategoryId: true,
        difficulty: true,
      },
    });
  });
});
