import { afterEach, describe, expect, it, vi } from "vitest";
import { QUESTION_TYPES } from "@/lib/meta";
import { generateQuestionWithAI } from "./ai";

const VALID_INPUT = {
  difficulty: "beginner",
  goal: "study",
  subjectId: "language",
  subcategoryId: "english",
} as const;

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

describe("generateQuestionWithAI", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_MODEL;
  });

  it("throws when OPENAI_API_KEY is missing", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(generateQuestionWithAI(VALID_INPUT)).rejects.toThrow(
      "OPENAI_API_KEY is not configured.",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns parsed question when provider responds with valid payload", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.OPENAI_MODEL = "o4-mini";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
                  prompt: "What is the capital of France?",
                  options: [
                    { id: "A", text: "Berlin", explanation: "Wrong." },
                    { id: "B", text: "Paris", explanation: "Correct." },
                    { id: "C", text: "Madrid", explanation: "Wrong." },
                    { id: "D", text: "Rome", explanation: "Wrong." },
                  ],
                  correctOptionIds: ["B"],
                }),
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const question = await generateQuestionWithAI(VALID_INPUT);

    expect(question).toMatchObject({
      questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
      prompt: "What is the capital of France?",
      options: [
        { id: "A", text: "Berlin", explanation: "Wrong." },
        { id: "B", text: "Paris", explanation: "Correct." },
        { id: "C", text: "Madrid", explanation: "Wrong." },
        { id: "D", text: "Rome", explanation: "Wrong." },
      ],
      correctOptionIds: ["B"],
    });
    expect(typeof question.id).toBe("string");
    expect(question.id.length).toBeGreaterThan(0);
  });

  it("throws provider error message for non-ok response", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: { message: "provider down" },
        }),
        { status: 500 },
      ),
    );

    await expect(generateQuestionWithAI(VALID_INPUT)).rejects.toThrow(
      "provider down",
    );
  });

  it("sends request to OpenAI chat completions endpoint", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
                  prompt: "Prompt",
                  options: [
                    { id: "A", text: "A", explanation: "A" },
                    { id: "B", text: "B", explanation: "B" },
                    { id: "C", text: "C", explanation: "C" },
                    { id: "D", text: "D", explanation: "D" },
                  ],
                  correctOptionIds: ["A"],
                }),
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await generateQuestionWithAI(VALID_INPUT);

    expect(fetchSpy).toHaveBeenCalledWith(
      OPENAI_URL,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
          "Content-Type": "application/json",
        }),
        method: "POST",
      }),
    );
  });
});
