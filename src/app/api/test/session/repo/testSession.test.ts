import { beforeEach, describe, expect, it, vi } from "vitest";

const { testSessionDeleteMany, testSessionFindUnique, testSessionUpsert } =
  vi.hoisted(() => ({
    testSessionDeleteMany: vi.fn(),
    testSessionFindUnique: vi.fn(),
    testSessionUpsert: vi.fn(),
  }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    testSession: {
      deleteMany: testSessionDeleteMany,
      findUnique: testSessionFindUnique,
      upsert: testSessionUpsert,
    },
  },
}));

import {
  deleteTestSession,
  readTestSession,
  upsertTestSession,
} from "./testSession";

describe("test session repo", () => {
  beforeEach(() => {
    testSessionDeleteMany.mockReset();
    testSessionFindUnique.mockReset();
    testSessionUpsert.mockReset();
  });

  it("reads a stored test session payload", async () => {
    testSessionFindUnique.mockResolvedValueOnce({
      id: "session-1",
      difficulty: "beginner",
      goal: "study",
      updatedAt: new Date("2026-02-11T10:00:00.000Z"),
      subjectId: "language",
      subcategoryId: "english",
    });

    await expect(readTestSession({ userId: "user-1" })).resolves.toEqual({
      id: "session-1",
      difficulty: "beginner",
      goal: "study",
      updatedAt: new Date("2026-02-11T10:00:00.000Z"),
      subjectId: "language",
      subcategoryId: "english",
    });

    expect(testSessionFindUnique).toHaveBeenCalledWith({
      select: {
        id: true,
        difficulty: true,
        goal: true,
        updatedAt: true,
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

    await upsertTestSession(
      { userId: "user-1" },
      "session-1",
      {
        difficulty: "beginner",
        goal: "study",
        subjectId: "language",
        subcategoryId: "english",
      },
    );

    expect(testSessionUpsert).toHaveBeenCalledWith({
      create: {
        id: "session-1",
        difficulty: "beginner",
        goal: "study",
        subjectId: "language",
        subcategoryId: "english",
        userId: "user-1",
      },
      update: {
        id: "session-1",
        difficulty: "beginner",
        goal: "study",
        subjectId: "language",
        subcategoryId: "english",
      },
      where: {
        userId: "user-1",
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
