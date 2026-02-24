import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  readAuthenticatedUserId,
  userFindUnique,
  userUpdate,
} = vi.hoisted(() => ({
  readAuthenticatedUserId: vi.fn(),
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
}));

vi.mock("@/app/api/test/session/auth", () => ({
  readAuthenticatedUserId,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: userFindUnique,
      update: userUpdate,
    },
  },
}));

import { GET, PATCH } from "./route";

const SETTINGS_PAYLOAD = {
  isSoundEnabled: true,
  isLargeQuestionTextEnabled: false,
} as const;

describe("user settings route", () => {
  beforeEach(() => {
    readAuthenticatedUserId.mockReset();
    userFindUnique.mockReset();
    userUpdate.mockReset();
  });

  describe("GET", () => {
    it("returns 401 when unauthenticated", async () => {
      readAuthenticatedUserId.mockResolvedValueOnce(null);

      const response = await GET();

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({
        error: "Unauthorized.",
      });
      expect(userFindUnique).not.toHaveBeenCalled();
    });

    it("returns settings for authenticated user", async () => {
      readAuthenticatedUserId.mockResolvedValueOnce("user-1");
      userFindUnique.mockResolvedValueOnce(SETTINGS_PAYLOAD);

      const response = await GET();

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        settings: SETTINGS_PAYLOAD,
      });
      expect(userFindUnique).toHaveBeenCalledWith({
        where: { id: "user-1" },
        select: {
          isSoundEnabled: true,
          isLargeQuestionTextEnabled: true,
        },
      });
    });

    it("returns 404 when user does not exist", async () => {
      readAuthenticatedUserId.mockResolvedValueOnce("user-1");
      userFindUnique.mockResolvedValueOnce(null);

      const response = await GET();

      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toEqual({
        error: "User not found.",
      });
    });
  });

  describe("PATCH", () => {
    it("returns 401 when unauthenticated", async () => {
      readAuthenticatedUserId.mockResolvedValueOnce(null);

      const response = await PATCH(
        new Request("http://localhost/api/user/settings", {
          method: "PATCH",
          body: JSON.stringify({ isSoundEnabled: false }),
        }),
      );

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({
        error: "Unauthorized.",
      });
      expect(userUpdate).not.toHaveBeenCalled();
    });

    it("returns 400 for invalid JSON", async () => {
      readAuthenticatedUserId.mockResolvedValueOnce("user-1");

      const response = await PATCH(
        new Request("http://localhost/api/user/settings", {
          method: "PATCH",
          body: "not-json",
        }),
      );

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "Invalid JSON body.",
      });
      expect(userUpdate).not.toHaveBeenCalled();
    });

    it("returns 400 for invalid payload", async () => {
      readAuthenticatedUserId.mockResolvedValueOnce("user-1");

      const response = await PATCH(
        new Request("http://localhost/api/user/settings", {
          method: "PATCH",
          body: JSON.stringify({ isSoundEnabled: "yes" }),
        }),
      );

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error:
          "isSoundEnabled and/or isLargeQuestionTextEnabled must be provided as boolean.",
      });
      expect(userUpdate).not.toHaveBeenCalled();
    });

    it("updates settings for authenticated user", async () => {
      readAuthenticatedUserId.mockResolvedValueOnce("user-1");
      userUpdate.mockResolvedValueOnce({
        isSoundEnabled: false,
        isLargeQuestionTextEnabled: false,
      });

      const response = await PATCH(
        new Request("http://localhost/api/user/settings", {
          method: "PATCH",
          body: JSON.stringify({ isSoundEnabled: false }),
        }),
      );

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        settings: {
          isSoundEnabled: false,
          isLargeQuestionTextEnabled: false,
        },
      });
      expect(userUpdate).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { isSoundEnabled: false },
        select: {
          isSoundEnabled: true,
          isLargeQuestionTextEnabled: true,
        },
      });
    });
  });
});
