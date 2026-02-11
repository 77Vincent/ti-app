import { beforeEach, describe, expect, it, vi } from "vitest";
import { QUESTION_TYPES } from "@/lib/meta";

const { deleteFavoriteQuestion, readAuthenticatedUserId, upsertFavoriteQuestion } =
  vi.hoisted(() => ({
    deleteFavoriteQuestion: vi.fn(),
    readAuthenticatedUserId: vi.fn(),
    upsertFavoriteQuestion: vi.fn(),
  }));

vi.mock("@/app/api/test/session/auth", () => ({
  readAuthenticatedUserId,
}));

vi.mock("./repo", () => ({
  deleteFavoriteQuestion,
  upsertFavoriteQuestion,
}));

const VALID_FAVORITE_PAYLOAD = {
  questionId: "question-1",
  subjectId: "language",
  subcategoryId: "english",
  difficulty: "beginner",
  goal: "study",
  questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
  prompt: "  What is the capital of France?  ",
  options: [
    { id: "A", text: "Paris", explanation: "Correct." },
    { id: "B", text: "Berlin", explanation: "Incorrect." },
  ],
  correctOptionIds: ["A"],
} as const;

describe("favorite question route", () => {
  beforeEach(() => {
    vi.resetModules();
    deleteFavoriteQuestion.mockReset();
    readAuthenticatedUserId.mockReset();
    upsertFavoriteQuestion.mockReset();

    readAuthenticatedUserId.mockResolvedValue("user-1");
    deleteFavoriteQuestion.mockResolvedValue(undefined);
    upsertFavoriteQuestion.mockResolvedValue(undefined);
  });

  it("returns 401 for unauthenticated favorite create", async () => {
    readAuthenticatedUserId.mockResolvedValue(null);
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/favorite", {
        method: "POST",
        body: JSON.stringify(VALID_FAVORITE_PAYLOAD),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Authentication required.",
    });
    expect(upsertFavoriteQuestion).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid favorite payload", async () => {
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/favorite", {
        method: "POST",
        body: JSON.stringify({
          ...VALID_FAVORITE_PAYLOAD,
          questionId: "",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid favorite question payload.",
    });
    expect(upsertFavoriteQuestion).not.toHaveBeenCalled();
  });

  it("creates or updates favorite question for authenticated user", async () => {
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/favorite", {
        method: "POST",
        body: JSON.stringify(VALID_FAVORITE_PAYLOAD),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(upsertFavoriteQuestion).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        questionId: "question-1",
        prompt: "What is the capital of France?",
      }),
    );
  });

  it("returns 401 for unauthenticated favorite delete", async () => {
    readAuthenticatedUserId.mockResolvedValue(null);
    const route = await import("./route");

    const response = await route.DELETE(
      new Request("http://localhost/api/questions/favorite", {
        method: "DELETE",
        body: JSON.stringify({ questionId: "question-1" }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Authentication required.",
    });
    expect(deleteFavoriteQuestion).not.toHaveBeenCalled();
  });

  it("returns 400 when questionId is missing for delete", async () => {
    const route = await import("./route");

    const response = await route.DELETE(
      new Request("http://localhost/api/questions/favorite", {
        method: "DELETE",
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "questionId is required.",
    });
    expect(deleteFavoriteQuestion).not.toHaveBeenCalled();
  });

  it("deletes favorite question for authenticated user", async () => {
    const route = await import("./route");

    const response = await route.DELETE(
      new Request("http://localhost/api/questions/favorite", {
        method: "DELETE",
        body: JSON.stringify({ questionId: "question-1" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(deleteFavoriteQuestion).toHaveBeenCalledWith("user-1", "question-1");
  });
});
