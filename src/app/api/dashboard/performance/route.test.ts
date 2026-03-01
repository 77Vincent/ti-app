import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  readAuthenticatedUserId,
  readStats,
} = vi.hoisted(() => ({
  readAuthenticatedUserId: vi.fn(),
  readStats: vi.fn(),
}));

vi.mock("@/app/api/test/session/auth", () => ({
  readAuthenticatedUserId,
}));

vi.mock("@/lib/stats/data", () => ({
  readStats,
}));

import { GET } from "./route";

describe("dashboard performance route", () => {
  beforeEach(() => {
    readAuthenticatedUserId.mockReset();
    readStats.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    readAuthenticatedUserId.mockResolvedValueOnce(null);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized.",
    });
    expect(readStats).not.toHaveBeenCalled();
  });

  it("returns performance payload for authenticated user", async () => {
    readAuthenticatedUserId.mockResolvedValueOnce("user-1");
    readStats.mockResolvedValueOnce({
      stats: {
        submittedCount: 10,
        correctCount: 8,
        wrongCount: 2,
        accuracyRatePercent: 80,
      },
      subcategorySubmissionStats: [],
      subcategoryAccuracyStats: [],
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      stats: {
        submittedCount: 10,
        correctCount: 8,
        wrongCount: 2,
        accuracyRatePercent: 80,
      },
      subcategorySubmissionStats: [],
      subcategoryAccuracyStats: [],
    });
    expect(readStats).toHaveBeenCalledWith({ userId: "user-1" });
  });
});
