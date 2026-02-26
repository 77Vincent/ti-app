import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  userFindUnique,
  userUpdate,
} = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: userFindUnique,
      update: userUpdate,
    },
  },
}));

import {
  incrementUserDailySubmittedCount,
  readUserDailySubmittedCount,
} from "./user";

describe("user repo daily submission counter", () => {
  beforeEach(() => {
    userFindUnique.mockReset();
    userUpdate.mockReset();
  });

  it("returns stored daily count when already on same UTC day", async () => {
    userFindUnique.mockResolvedValueOnce({
      dailySubmittedCount: 4,
      dailySubmittedCountDate: new Date("2026-02-26T00:00:00.000Z"),
    });

    await expect(
      readUserDailySubmittedCount("user-1", new Date("2026-02-26T15:00:00.000Z")),
    ).resolves.toBe(4);

    expect(userFindUnique).toHaveBeenCalledWith({
      where: {
        id: "user-1",
      },
      select: {
        dailySubmittedCount: true,
        dailySubmittedCountDate: true,
      },
    });
    expect(userUpdate).not.toHaveBeenCalled();
  });

  it("resets daily count when UTC day changes", async () => {
    userFindUnique.mockResolvedValueOnce({
      dailySubmittedCount: 9,
      dailySubmittedCountDate: new Date("2026-02-25T00:00:00.000Z"),
    });
    userUpdate.mockResolvedValueOnce({
      dailySubmittedCount: 0,
    });

    await expect(
      readUserDailySubmittedCount("user-1", new Date("2026-02-26T02:30:00.000Z")),
    ).resolves.toBe(0);

    expect(userUpdate).toHaveBeenCalledWith({
      where: {
        id: "user-1",
      },
      data: {
        dailySubmittedCount: 0,
        dailySubmittedCountDate: new Date("2026-02-26T00:00:00.000Z"),
      },
      select: {
        dailySubmittedCount: true,
      },
    });
  });

  it("initializes daily count when stored date is null", async () => {
    userFindUnique.mockResolvedValueOnce({
      dailySubmittedCount: 3,
      dailySubmittedCountDate: null,
    });
    userUpdate.mockResolvedValueOnce({
      dailySubmittedCount: 0,
    });

    await expect(
      readUserDailySubmittedCount("user-1", new Date("2026-02-26T09:45:00.000Z")),
    ).resolves.toBe(0);

    expect(userUpdate).toHaveBeenCalledWith({
      where: {
        id: "user-1",
      },
      data: {
        dailySubmittedCount: 0,
        dailySubmittedCountDate: new Date("2026-02-26T00:00:00.000Z"),
      },
      select: {
        dailySubmittedCount: true,
      },
    });
  });

  it("increments daily count on same UTC day", async () => {
    userFindUnique.mockResolvedValueOnce({
      dailySubmittedCount: 4,
      dailySubmittedCountDate: new Date("2026-02-26T00:00:00.000Z"),
    });
    userUpdate.mockResolvedValueOnce({
      dailySubmittedCount: 5,
    });

    await expect(
      incrementUserDailySubmittedCount("user-1", new Date("2026-02-26T18:00:00.000Z")),
    ).resolves.toBe(5);

    expect(userUpdate).toHaveBeenCalledWith({
      where: {
        id: "user-1",
      },
      data: {
        dailySubmittedCount: {
          increment: 1,
        },
      },
      select: {
        dailySubmittedCount: true,
      },
    });
  });

  it("resets then increments when UTC day changes", async () => {
    userFindUnique.mockResolvedValueOnce({
      dailySubmittedCount: 10,
      dailySubmittedCountDate: new Date("2026-02-25T00:00:00.000Z"),
    });
    userUpdate
      .mockResolvedValueOnce({
        dailySubmittedCount: 0,
      })
      .mockResolvedValueOnce({
        dailySubmittedCount: 1,
      });

    await expect(
      incrementUserDailySubmittedCount("user-1", new Date("2026-02-26T01:00:00.000Z")),
    ).resolves.toBe(1);

    expect(userUpdate).toHaveBeenNthCalledWith(1, {
      where: {
        id: "user-1",
      },
      data: {
        dailySubmittedCount: 0,
        dailySubmittedCountDate: new Date("2026-02-26T00:00:00.000Z"),
      },
      select: {
        dailySubmittedCount: true,
      },
    });
    expect(userUpdate).toHaveBeenNthCalledWith(2, {
      where: {
        id: "user-1",
      },
      data: {
        dailySubmittedCount: {
          increment: 1,
        },
      },
      select: {
        dailySubmittedCount: true,
      },
    });
  });

  it("throws when user does not exist", async () => {
    userFindUnique.mockResolvedValueOnce(null);

    await expect(
      readUserDailySubmittedCount("missing-user", new Date("2026-02-26T00:00:00.000Z")),
    ).rejects.toThrowError("User not found.");
    expect(userUpdate).not.toHaveBeenCalled();
  });
});
