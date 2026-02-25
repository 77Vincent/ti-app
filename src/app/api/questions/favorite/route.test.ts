import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  deleteFavoriteQuestion,
  isQuestionFavorited,
  readFavoriteQuestions,
  readAuthenticatedUserId,
  upsertFavoriteQuestion,
} =
  vi.hoisted(() => ({
    deleteFavoriteQuestion: vi.fn(),
    isQuestionFavorited: vi.fn(),
    readFavoriteQuestions: vi.fn(),
    readAuthenticatedUserId: vi.fn(),
    upsertFavoriteQuestion: vi.fn(),
  }));

vi.mock("@/app/api/test/session/auth", () => ({
  readAuthenticatedUserId,
}));

vi.mock("./repo", () => ({
  deleteFavoriteQuestion,
  isQuestionFavorited,
  readFavoriteQuestions,
  upsertFavoriteQuestion,
}));

const VALID_FAVORITE_PAYLOAD = {
  questionId: "question-1",
} as const;

describe("favorite question route", () => {
  beforeEach(() => {
    vi.resetModules();
    deleteFavoriteQuestion.mockReset();
    isQuestionFavorited.mockReset();
    readFavoriteQuestions.mockReset();
    readAuthenticatedUserId.mockReset();
    upsertFavoriteQuestion.mockReset();

    readAuthenticatedUserId.mockResolvedValue("user-1");
    deleteFavoriteQuestion.mockResolvedValue(undefined);
    isQuestionFavorited.mockResolvedValue(false);
    readFavoriteQuestions.mockResolvedValue([]);
    upsertFavoriteQuestion.mockResolvedValue(undefined);
  });

  it("returns 400 when neither questionId nor subjectId is provided for get", async () => {
    const route = await import("./route");

    const response = await route.GET(
      new Request("http://localhost/api/questions/favorite", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "questionId or subjectId is required.",
    });
    expect(isQuestionFavorited).not.toHaveBeenCalled();
    expect(readFavoriteQuestions).not.toHaveBeenCalled();
  });

  it("returns false for unauthenticated favorite get", async () => {
    readAuthenticatedUserId.mockResolvedValue(null);
    const route = await import("./route");

    const response = await route.GET(
      new Request("http://localhost/api/questions/favorite?questionId=question-1", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ isFavorite: false });
    expect(isQuestionFavorited).not.toHaveBeenCalled();
    expect(readFavoriteQuestions).not.toHaveBeenCalled();
  });

  it("returns favorite state for authenticated user", async () => {
    isQuestionFavorited.mockResolvedValueOnce(true);
    const route = await import("./route");

    const response = await route.GET(
      new Request("http://localhost/api/questions/favorite?questionId=question-1", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ isFavorite: true });
    expect(isQuestionFavorited).toHaveBeenCalledWith("user-1", "question-1");
    expect(readFavoriteQuestions).not.toHaveBeenCalled();
  });

  it("returns empty list for unauthenticated favorite list get", async () => {
    readAuthenticatedUserId.mockResolvedValue(null);
    const route = await import("./route");

    const response = await route.GET(
      new Request("http://localhost/api/questions/favorite?subjectId=language", {
        method: "GET",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ questions: [] });
    expect(readFavoriteQuestions).not.toHaveBeenCalled();
  });

  it("returns favorite list for authenticated user", async () => {
    readFavoriteQuestions.mockResolvedValueOnce([
      {
        id: "question-1",
        prompt: "Prompt 1",
      },
    ]);
    const route = await import("./route");

    const response = await route.GET(
      new Request(
        "http://localhost/api/questions/favorite?subjectId=language&subcategoryId=english",
        {
          method: "GET",
        },
      ),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      questions: [{ id: "question-1", prompt: "Prompt 1" }],
    });
    expect(readFavoriteQuestions).toHaveBeenCalledWith(
      "user-1",
      "language",
      "english",
    );
    expect(isQuestionFavorited).not.toHaveBeenCalled();
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
      error: "questionId is required.",
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
    expect(upsertFavoriteQuestion).toHaveBeenCalledWith("user-1", "question-1");
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
