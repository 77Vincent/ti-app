import { QUESTION_TYPES } from "@/lib/meta";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toggleQuestionFavorite } from "./favorite";
import type { Question } from "../types";

const { addFavoriteQuestion, removeFavoriteQuestion } = vi.hoisted(() => ({
  addFavoriteQuestion: vi.fn(),
  removeFavoriteQuestion: vi.fn(),
}));

vi.mock("../api", () => ({
  addFavoriteQuestion,
  removeFavoriteQuestion,
  QuestionRunnerApiError: class QuestionRunnerApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
      super(message);
      this.name = "QuestionRunnerApiError";
      this.status = status;
    }
  },
}));

const QUESTION: Question = {
  id: "q-1",
  questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
  prompt: "Prompt",
  options: [
    { id: "A", text: "Option A", explanation: "A" },
    { id: "B", text: "Option B", explanation: "B" },
    { id: "C", text: "Option C", explanation: "C" },
    { id: "D", text: "Option D", explanation: "D" },
  ],
  correctOptionIds: ["A"],
};

const BASE_INPUT = {
  difficulty: "beginner",
  question: QUESTION,
  subjectId: "language",
  subcategoryId: "english",
} as const;

describe("toggleQuestionFavorite", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("removes favorite when question is currently favorited", async () => {
    const result = await toggleQuestionFavorite({
      ...BASE_INPUT,
      isFavorite: true,
    });

    expect(removeFavoriteQuestion).toHaveBeenCalledWith("q-1");
    expect(addFavoriteQuestion).not.toHaveBeenCalled();
    expect(result).toEqual({ type: "success", isFavorite: false });
  });

  it("adds favorite when question is not favorited", async () => {
    const result = await toggleQuestionFavorite({
      ...BASE_INPUT,
      isFavorite: false,
    });

    expect(addFavoriteQuestion).toHaveBeenCalledWith({
      difficulty: "beginner",
      question: QUESTION,
      subjectId: "language",
      subcategoryId: "english",
    });
    expect(removeFavoriteQuestion).not.toHaveBeenCalled();
    expect(result).toEqual({ type: "success", isFavorite: true });
  });

  it("maps auth failures to auth_required", async () => {
    const { QuestionRunnerApiError } = await import("../api");
    addFavoriteQuestion.mockRejectedValueOnce(
      new QuestionRunnerApiError("unauthorized", 401),
    );

    const result = await toggleQuestionFavorite({
      ...BASE_INPUT,
      isFavorite: false,
    });

    expect(result).toEqual({ type: "auth_required" });
  });

  it("returns generic errors unchanged", async () => {
    const error = new Error("boom");
    removeFavoriteQuestion.mockRejectedValueOnce(error);

    const result = await toggleQuestionFavorite({
      ...BASE_INPUT,
      isFavorite: true,
    });

    expect(result).toEqual({ type: "error", error });
  });
});
