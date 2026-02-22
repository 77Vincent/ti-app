import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchQuestion } from "./question";
import type { Question } from "../types";

const VALID_INPUT = {
  subjectId: "language",
  subcategoryId: "english",
} as const;

const MOCK_QUESTION: Question = {
  id: "q-1",
  prompt: "Prompt",
  difficulty: "A1",
  options: [
    { text: "Option A", explanation: "A" },
    { text: "Option B", explanation: "B" },
    { text: "Option C", explanation: "C" },
    { text: "Option D", explanation: "D" },
  ],
  correctOptionIndexes: [0],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchQuestion", () => {
  it("returns one question when response is ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          question: MOCK_QUESTION,
        }),
        { status: 200 },
      ),
    );

    await expect(fetchQuestion(VALID_INPUT)).resolves.toEqual(MOCK_QUESTION);
  });

  it("throws when question is missing in response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
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
