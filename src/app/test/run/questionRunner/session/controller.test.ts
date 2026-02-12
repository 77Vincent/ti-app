import { describe, expect, it, vi } from "vitest";
import { createQuestionSessionController } from "./controller";

describe("question session controller", () => {
  it("loads initial question", async () => {
    const loadQuestion = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce("Q1");

    const controller = createQuestionSessionController({
      loadQuestion,
    });

    const initialQuestion = await controller.loadInitialQuestion();
    expect(initialQuestion).toBe("Q1");
    expect(loadQuestion).toHaveBeenCalledTimes(1);
  });

  it("loads next question on consume", async () => {
    const loadQuestion = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce("Q1")
      .mockResolvedValueOnce("Q2");

    const controller = createQuestionSessionController({
      loadQuestion,
    });

    await controller.loadInitialQuestion();
    const nextQuestion = await controller.consumeNextQuestion();
    expect(nextQuestion).toBe("Q2");
    expect(loadQuestion).toHaveBeenCalledTimes(2);
  });

  it("allows clear without throwing", async () => {
    const loadQuestion = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce("Q1");

    const controller = createQuestionSessionController({
      loadQuestion,
    });

    expect(() => controller.clear()).not.toThrow();
  });
});
