import { API_PATHS } from "@/lib/config/paths";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addFavoriteQuestion,
  readFavoriteQuestionState,
  removeFavoriteQuestion,
} from "./favorite";
import { QuestionRunnerApiError } from "./error";

const VALID_QUESTION_ID = "q-1";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("addFavoriteQuestion", () => {
  it("posts favorite payload", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await addFavoriteQuestion(VALID_QUESTION_ID);

    expect(fetchSpy).toHaveBeenCalledWith(API_PATHS.QUESTIONS_FAVORITE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: "q-1",
      }),
    });
  });

  it("throws request error for non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Authentication required." }), {
        status: 401,
      }),
    );

    await expect(addFavoriteQuestion(VALID_QUESTION_ID)).rejects.toMatchObject({
      message: "Authentication required.",
      name: "QuestionRunnerApiError",
      status: 401,
    } satisfies Partial<QuestionRunnerApiError>);
  });
});

describe("removeFavoriteQuestion", () => {
  it("deletes favorite by question id", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await removeFavoriteQuestion("q-1");

    expect(fetchSpy).toHaveBeenCalledWith(API_PATHS.QUESTIONS_FAVORITE, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: "q-1" }),
    });
  });
});

describe("readFavoriteQuestionState", () => {
  it("gets favorite state by question id", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ isFavorite: true }), { status: 200 }),
    );

    await expect(readFavoriteQuestionState("q-1")).resolves.toBe(true);

    expect(fetchSpy).toHaveBeenCalledWith(
      `${API_PATHS.QUESTIONS_FAVORITE}?questionId=q-1`,
      {
        cache: "no-store",
        method: "GET",
      },
    );
  });

  it("throws request error for non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Authentication required." }), {
        status: 401,
      }),
    );

    await expect(readFavoriteQuestionState("q-1")).rejects.toMatchObject({
      message: "Authentication required.",
      name: "QuestionRunnerApiError",
      status: 401,
    } satisfies Partial<QuestionRunnerApiError>);
  });
});
