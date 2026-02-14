import { QUESTION_TYPES } from "@/lib/meta";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchQuestion,
  isAnonymousQuestionLimitError,
} from "./question";
import { QuestionRunnerApiError } from "./error";
import type { Question } from "../types";

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

const MOCK_NEXT_QUESTION: Question = {
  id: "q-2",
  questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
  prompt: "Prompt 2",
  options: [
    { id: "A", text: "Option A2", explanation: "A2" },
    { id: "B", text: "Option B2", explanation: "B2" },
    { id: "C", text: "Option C2", explanation: "C2" },
    { id: "D", text: "Option D2", explanation: "D2" },
  ],
  correctOptionIds: ["B"],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchQuestion", () => {
  it("returns two questions when response is ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          question: MOCK_QUESTION,
          nextQuestion: MOCK_NEXT_QUESTION,
        }),
        { status: 200 },
      ),
    );

    await expect(fetchQuestion(VALID_INPUT)).resolves.toEqual({
      question: MOCK_QUESTION,
      nextQuestion: MOCK_NEXT_QUESTION,
    });
  });

  it("throws when next question is missing in response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ question: MOCK_QUESTION }), { status: 200 }),
    );

    await expect(fetchQuestion(VALID_INPUT)).rejects.toMatchObject({
      name: "QuestionRunnerApiError",
    });
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

    await expect(fetchQuestion(VALID_INPUT)).rejects.toMatchObject({
      message:
        "You have reached the anonymous limit of 5 questions. Please log in to continue.",
      name: "QuestionRunnerApiError",
      status: 403,
    });
  });
});

describe("isAnonymousQuestionLimitError", () => {
  it("returns true for anonymous limit request error", () => {
    expect(
      isAnonymousQuestionLimitError(
        new QuestionRunnerApiError("limit", 403),
      ),
    ).toBe(true);
  });

  it("returns false for non-limit errors", () => {
    expect(
      isAnonymousQuestionLimitError(
        new QuestionRunnerApiError("not-limit", 500),
      ),
    ).toBe(false);
    expect(isAnonymousQuestionLimitError(new Error("x"))).toBe(false);
    expect(isAnonymousQuestionLimitError("x")).toBe(false);
  });
});
