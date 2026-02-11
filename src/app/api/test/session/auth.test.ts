import { beforeEach, describe, expect, it, vi } from "vitest";

const { findUserIdBySessionToken, readSessionTokenCookieValues } = vi.hoisted(
  () => ({
    findUserIdBySessionToken: vi.fn(),
    readSessionTokenCookieValues: vi.fn(),
  }),
);

vi.mock("./cookie/authSession", () => ({
  readSessionTokenCookieValues,
}));

vi.mock("./repo/authSession", () => ({
  findUserIdBySessionToken,
}));

import { readAuthenticatedUserId } from "./auth";

describe("readAuthenticatedUserId", () => {
  beforeEach(() => {
    findUserIdBySessionToken.mockReset();
    readSessionTokenCookieValues.mockReset();
  });

  it("returns null when no session token cookie exists", async () => {
    readSessionTokenCookieValues.mockResolvedValueOnce([]);

    await expect(readAuthenticatedUserId()).resolves.toBeNull();
    expect(findUserIdBySessionToken).not.toHaveBeenCalled();
  });

  it("returns the first matched user id", async () => {
    readSessionTokenCookieValues.mockResolvedValueOnce(["token-a", "token-b"]);
    findUserIdBySessionToken
      .mockResolvedValueOnce("user-1")
      .mockResolvedValueOnce("user-2");

    await expect(readAuthenticatedUserId()).resolves.toBe("user-1");
    expect(findUserIdBySessionToken).toHaveBeenCalledTimes(1);
    expect(findUserIdBySessionToken).toHaveBeenCalledWith("token-a");
  });

  it("keeps looking when a token does not resolve to user", async () => {
    readSessionTokenCookieValues.mockResolvedValueOnce(["token-a", "token-b"]);
    findUserIdBySessionToken
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce("user-2");

    await expect(readAuthenticatedUserId()).resolves.toBe("user-2");
    expect(findUserIdBySessionToken).toHaveBeenCalledTimes(2);
    expect(findUserIdBySessionToken).toHaveBeenNthCalledWith(1, "token-a");
    expect(findUserIdBySessionToken).toHaveBeenNthCalledWith(2, "token-b");
  });
});
