import { beforeEach, describe, expect, it, vi } from "vitest";

const { sessionFindUnique } = vi.hoisted(() => ({
  sessionFindUnique: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    session: {
      findUnique: sessionFindUnique,
    },
  },
}));

import { findUserIdBySessionToken } from "./authSession";

describe("auth session repo", () => {
  beforeEach(() => {
    sessionFindUnique.mockReset();
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
});
