import { QUESTION_TYPES } from "@/lib/meta";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchGeneratedQuestion,
  GenerateQuestionRequestError,
  isAnonymousQuestionLimitError,
} from "./api";
import type { Question } from "./types";

const VALID_INPUT = {
  difficulty: "beginner",
  subjectId: "language",
  subcategoryId: "english",
} as const;

const MOCK_QUESTION: Question = {
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

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchGeneratedQuestion", () => {
  it("returns question when response is ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ question: MOCK_QUESTION }), { status: 200 }),
    );

    await expect(fetchGeneratedQuestion(VALID_INPUT)).resolves.toEqual(MOCK_QUESTION);
  });

  it("throws request error with status for non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: "You have reached the anonymous limit of 5 questions. Please log in to continue.",
        }),
        { status: 403 },
      ),
    );

    await expect(fetchGeneratedQuestion(VALID_INPUT)).rejects.toMatchObject({
      message:
        "You have reached the anonymous limit of 5 questions. Please log in to continue.",
      name: "GenerateQuestionRequestError",
      status: 403,
    });
  });
});

describe("isAnonymousQuestionLimitError", () => {
  it("returns true for anonymous limit request error", () => {
    expect(
      isAnonymousQuestionLimitError(
        new GenerateQuestionRequestError("limit", 403),
      ),
    ).toBe(true);
  });

  it("returns false for non-limit errors", () => {
    expect(
      isAnonymousQuestionLimitError(
        new GenerateQuestionRequestError("not-limit", 500),
      ),
    ).toBe(false);
    expect(isAnonymousQuestionLimitError(new Error("x"))).toBe(false);
    expect(isAnonymousQuestionLimitError("x")).toBe(false);
  });
});
