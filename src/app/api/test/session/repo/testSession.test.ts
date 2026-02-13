import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  testSessionDeleteMany,
  testSessionFindUnique,
  testSessionUpdateMany,
  testSessionUpsert,
} =
  vi.hoisted(() => ({
    testSessionDeleteMany: vi.fn(),
    testSessionFindUnique: vi.fn(),
    testSessionUpdateMany: vi.fn(),
    testSessionUpsert: vi.fn(),
  }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
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

  it("upserts user-owned test session", async () => {
    testSessionUpsert.mockResolvedValueOnce(undefined);
    const startedAtMs = 1_739_263_200_000;

    await upsertTestSession(
      { userId: "user-1" },
      "session-1",
      {
        difficulty: "beginner",
        goal: "study",
        subjectId: "language",
        subcategoryId: "english",
      },
      startedAtMs,
    );

    expect(testSessionUpsert).toHaveBeenCalledWith({
      create: {
        id: "session-1",
        correctCount: 0,
        difficulty: "beginner",
        goal: "study",
        startedAt: new Date(startedAtMs),
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
        startedAt: new Date(startedAtMs),
        submittedCount: 0,
        subjectId: "language",
        subcategoryId: "english",
      },
      where: {
        userId: "user-1",
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

  it("deletes by identity selector", async () => {
    testSessionDeleteMany.mockResolvedValueOnce({ count: 1 });

    await deleteTestSession({ userId: "user-1" });

    expect(testSessionDeleteMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
      },
    });
  });
});
