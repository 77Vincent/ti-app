import { QUESTION_TYPES } from "@/lib/meta";
import { API_PATHS } from "@/lib/config/paths";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addFavoriteQuestion,
  readFavoriteQuestionState,
  removeFavoriteQuestion,
} from "./favorite";
import { QuestionRunnerApiError } from "./error";
import type { Question } from "../types";

const VALID_INPUT = {
  subjectId: "language",
  subcategoryId: "english",
  question: {
    id: "q-1",
    questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
    prompt: "Prompt",
    difficulty: "A1",
    options: [
      { text: "Option A", explanation: "A" },
      { text: "Option B", explanation: "B" },
      { text: "Option C", explanation: "C" },
      { text: "Option D", explanation: "D" },
    ],
    correctOptionIndexes: [0],
  } as Question,
} as const;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("addFavoriteQuestion", () => {
  it("posts favorite payload", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await addFavoriteQuestion(VALID_INPUT);

    expect(fetchSpy).toHaveBeenCalledWith(API_PATHS.QUESTIONS_FAVORITE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: "language",
        subcategoryId: "english",
        questionId: "q-1",
        questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
        prompt: "Prompt",
        difficulty: "A1",
        options: VALID_INPUT.question.options,
        correctOptionIndexes: [0],
      }),
    });
  });

  it("throws request error for non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Authentication required." }), {
        status: 401,
      }),
    );

    await expect(addFavoriteQuestion(VALID_INPUT)).rejects.toMatchObject({
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
