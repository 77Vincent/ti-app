import { beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_NON_PRO_DAILY_SUBMITTED_QUESTION_COUNT } from "@/lib/config/testPolicy";

const { readAuthenticatedUserId, isUserPro, readUserDailySubmittedCount } = vi.hoisted(() => ({
  readAuthenticatedUserId: vi.fn(),
  isUserPro: vi.fn(),
  readUserDailySubmittedCount: vi.fn(),
}));

vi.mock("@/app/api/test/session/auth", () => ({
  readAuthenticatedUserId,
}));

vi.mock("@/lib/billing/pro", () => ({
  isUserPro,
}));

vi.mock("@/app/api/test/session/repo/user", () => ({
  readUserDailySubmittedCount,
}));

import { GET } from "./route";

describe("user plan route", () => {
  beforeEach(() => {
    readAuthenticatedUserId.mockReset();
    isUserPro.mockReset();
    readUserDailySubmittedCount.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    readAuthenticatedUserId.mockResolvedValueOnce(null);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized.",
    });
    expect(isUserPro).not.toHaveBeenCalled();
    expect(readUserDailySubmittedCount).not.toHaveBeenCalled();
  });

  it("returns plan payload for pro users", async () => {
    readAuthenticatedUserId.mockResolvedValueOnce("user-1");
    isUserPro.mockResolvedValueOnce(true);
    readUserDailySubmittedCount.mockResolvedValueOnce(25);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      isPro: true,
      dailySubmittedCount: 25,
      dailySubmittedQuota: null,
    });
    expect(isUserPro).toHaveBeenCalledWith("user-1");
    expect(readUserDailySubmittedCount).toHaveBeenCalledWith("user-1");
  });

  it("returns plan payload for non-pro users", async () => {
    readAuthenticatedUserId.mockResolvedValueOnce("user-1");
    isUserPro.mockResolvedValueOnce(false);
    readUserDailySubmittedCount.mockResolvedValueOnce(7);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      isPro: false,
      dailySubmittedCount: 7,
      dailySubmittedQuota: MAX_NON_PRO_DAILY_SUBMITTED_QUESTION_COUNT,
    });
    expect(isUserPro).toHaveBeenCalledWith("user-1");
    expect(readUserDailySubmittedCount).toHaveBeenCalledWith("user-1");
  });
});
