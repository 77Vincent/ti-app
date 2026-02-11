import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  sessionFindUnique,
  testSessionDeleteMany,
  testSessionFindUnique,
  testSessionUpsert,
} = vi.hoisted(() => ({
  sessionFindUnique: vi.fn(),
  testSessionDeleteMany: vi.fn(),
  testSessionFindUnique: vi.fn(),
  testSessionUpsert: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    session: {
      findUnique: sessionFindUnique,
    },
    testSession: {
      deleteMany: testSessionDeleteMany,
      findUnique: testSessionFindUnique,
      upsert: testSessionUpsert,
    },
  },
}));

import {
  deleteTestSession,
  findUserIdBySessionToken,
  readTestSession,
  upsertTestSession,
} from "./repo";

describe("test session repo", () => {
  beforeEach(() => {
    sessionFindUnique.mockReset();
    testSessionDeleteMany.mockReset();
    testSessionFindUnique.mockReset();
    testSessionUpsert.mockReset();
  });

  it("returns null when auth session token is missing", async () => {
    sessionFindUnique.mockResolvedValueOnce(null);

    await expect(
      findUserIdBySessionToken("missing-token", new Date("2026-01-01T00:00:00Z")),
    ).resolves.toBeNull();

    expect(sessionFindUnique).toHaveBeenCalledWith({
      select: {
        expires: true,
        userId: true,
      },
      where: {
        sessionToken: "missing-token",
      },
    });
  });

  it("returns null when auth session token is expired", async () => {
    sessionFindUnique.mockResolvedValueOnce({
      expires: new Date("2025-12-31T23:59:59Z"),
      userId: "user-1",
    });

    await expect(
      findUserIdBySessionToken("expired-token", new Date("2026-01-01T00:00:00Z")),
    ).resolves.toBeNull();
  });

  it("returns userId when auth session token is valid", async () => {
    sessionFindUnique.mockResolvedValueOnce({
      expires: new Date("2026-12-31T23:59:59Z"),
      userId: "user-1",
    });

    await expect(
      findUserIdBySessionToken("valid-token", new Date("2026-01-01T00:00:00Z")),
    ).resolves.toBe("user-1");
  });

  it("reads a stored test session payload", async () => {
    testSessionFindUnique.mockResolvedValueOnce({
      difficulty: "beginner",
      subjectId: "language",
      subcategoryId: "english",
    });

    await expect(readTestSession({ userId: "user-1" })).resolves.toEqual({
      difficulty: "beginner",
      subjectId: "language",
      subcategoryId: "english",
    });

    expect(testSessionFindUnique).toHaveBeenCalledWith({
      select: {
        difficulty: true,
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
      {
        difficulty: "beginner",
        subjectId: "language",
        subcategoryId: "english",
      },
    );

    expect(testSessionUpsert).toHaveBeenCalledWith({
      create: {
        difficulty: "beginner",
        subjectId: "language",
        subcategoryId: "english",
        userId: "user-1",
      },
      update: {
        difficulty: "beginner",
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
