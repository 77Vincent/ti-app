import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  parseQuestionParam,
  readAuthenticatedUserId,
  updateAuthTestSessionDifficultyByContext,
} = vi.hoisted(() => ({
  parseQuestionParam: vi.fn(),
  readAuthenticatedUserId: vi.fn(),
  updateAuthTestSessionDifficultyByContext: vi.fn(),
}));

vi.mock("@/lib/testSession/validation", () => ({
  parseQuestionParam,
}));

vi.mock("../auth", () => ({
  readAuthenticatedUserId,
}));

vi.mock("../repo/testSession", () => ({
  updateAuthTestSessionDifficultyByContext,
}));

import { PATCH } from "./route";

const VALID_INPUT = {
  subjectId: "language",
  subcategoryId: "english",
  difficulty: "A1",
} as const;

const STORED_SESSION = {
  id: "session-1",
  correctCount: 2,
  submittedCount: 3,
  subjectId: "language",
  subcategoryId: "english",
  difficulty: "A1",
} as const;

describe("test session difficulty route PATCH", () => {
  beforeEach(() => {
    parseQuestionParam.mockReset();
    readAuthenticatedUserId.mockReset();
    updateAuthTestSessionDifficultyByContext.mockReset();

    parseQuestionParam.mockReturnValue(VALID_INPUT);
    readAuthenticatedUserId.mockResolvedValue("user-1");
    updateAuthTestSessionDifficultyByContext.mockResolvedValue(STORED_SESSION);
  });

  it("returns 401 when unauthenticated", async () => {
    readAuthenticatedUserId.mockResolvedValueOnce(null);

    const response = await PATCH(
      new Request("http://localhost/api/test/session/difficulty", {
        method: "PATCH",
        body: JSON.stringify(VALID_INPUT),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized." });
    expect(parseQuestionParam).not.toHaveBeenCalled();
    expect(updateAuthTestSessionDifficultyByContext).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid JSON", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/test/session/difficulty", {
        method: "PATCH",
        body: "not-json",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid JSON body.",
    });
    expect(parseQuestionParam).not.toHaveBeenCalled();
    expect(updateAuthTestSessionDifficultyByContext).not.toHaveBeenCalled();
  });

  it("updates using authenticated user", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/test/session/difficulty", {
        method: "PATCH",
        body: JSON.stringify(VALID_INPUT),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      session: STORED_SESSION,
    });
    expect(updateAuthTestSessionDifficultyByContext).toHaveBeenCalledWith(
      {
        userId: "user-1",
        subjectId: "language",
        subcategoryId: "english",
      },
      "A1",
    );
  });

  it("returns 400 for invalid context payload", async () => {
    parseQuestionParam.mockReturnValueOnce(null);

    const response = await PATCH(
      new Request("http://localhost/api/test/session/difficulty", {
        method: "PATCH",
        body: JSON.stringify(VALID_INPUT),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "subjectId, subcategoryId, and difficulty are required.",
    });
    expect(updateAuthTestSessionDifficultyByContext).not.toHaveBeenCalled();
  });

  it("returns 404 when target session is not found", async () => {
    updateAuthTestSessionDifficultyByContext.mockResolvedValueOnce(null);

    const response = await PATCH(
      new Request("http://localhost/api/test/session/difficulty", {
        method: "PATCH",
        body: JSON.stringify(VALID_INPUT),
      }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Test session not found.",
    });
    expect(updateAuthTestSessionDifficultyByContext).toHaveBeenCalledWith(
      {
        userId: "user-1",
        subjectId: "language",
        subcategoryId: "english",
      },
      "A1",
    );
  });

  it("updates difficulty by user/context and returns session", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/test/session/difficulty", {
        method: "PATCH",
        body: JSON.stringify(VALID_INPUT),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      session: STORED_SESSION,
    });
    expect(updateAuthTestSessionDifficultyByContext).toHaveBeenCalledWith(
      {
        userId: "user-1",
        subjectId: "language",
        subcategoryId: "english",
      },
      "A1",
    );
  });
});
