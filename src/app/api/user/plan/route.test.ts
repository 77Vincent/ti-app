import { beforeEach, describe, expect, it, vi } from "vitest";

const { readAuthenticatedUserId, isUserPro } = vi.hoisted(() => ({
  readAuthenticatedUserId: vi.fn(),
  isUserPro: vi.fn(),
}));

vi.mock("@/app/api/test/session/auth", () => ({
  readAuthenticatedUserId,
}));

vi.mock("@/lib/billing/pro", () => ({
  isUserPro,
}));

import { GET } from "./route";

describe("user plan route", () => {
  beforeEach(() => {
    readAuthenticatedUserId.mockReset();
    isUserPro.mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    readAuthenticatedUserId.mockResolvedValueOnce(null);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized.",
    });
    expect(isUserPro).not.toHaveBeenCalled();
  });

  it("returns pro status for authenticated users", async () => {
    readAuthenticatedUserId.mockResolvedValueOnce("user-1");
    isUserPro.mockResolvedValueOnce(true);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      isPro: true,
    });
    expect(isUserPro).toHaveBeenCalledWith("user-1");
  });
});
