import { describe, expect, it, vi } from "vitest";
import { createQuestionSessionController } from "./controller";

describe("question session controller", () => {
  it("loads initial question and prefetches to capacity", async () => {
    const loadQuestion = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce("Q1")
      .mockResolvedValueOnce("Q2")
      .mockResolvedValueOnce("Q3");

    const controller = createQuestionSessionController({
      bufferSize: 2,
      loadQuestion,
    });

    const initialQuestion = await controller.loadInitialQuestion();
    expect(initialQuestion).toBe("Q1");

    await controller.prefetchToCapacity();

    expect(controller.getBufferedCount()).toBe(2);
    expect(controller.hasBufferedQuestion()).toBe(true);
    expect(loadQuestion).toHaveBeenCalledTimes(3);
  });

  it("consumes buffered question first and refills on explicit prefetch", async () => {
    const loadQuestion = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce("Q1")
      .mockResolvedValueOnce("Q2")
      .mockResolvedValueOnce("Q3")
      .mockResolvedValueOnce("Q4");

    const controller = createQuestionSessionController({
      bufferSize: 2,
      loadQuestion,
    });

    await controller.loadInitialQuestion();
    await controller.prefetchToCapacity();

    const nextQuestion = await controller.consumeNextQuestion();
    expect(nextQuestion).toBe("Q2");

    await controller.prefetchToCapacity();
    expect(controller.getBufferedCount()).toBe(2);
    expect(loadQuestion).toHaveBeenCalledTimes(4);
  });

  it("falls back to direct load when buffer is empty", async () => {
    const loadQuestion = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce("Q1");

    const controller = createQuestionSessionController({
      bufferSize: 2,
      loadQuestion,
    });

    const nextQuestion = await controller.consumeNextQuestion();
    expect(nextQuestion).toBe("Q1");
    expect(loadQuestion).toHaveBeenCalledTimes(1);
  });
});
