import { describe, expect, it, vi } from "vitest";
import { loadAndApplyQuestion } from "./questionLoad";

describe("loadAndApplyQuestion", () => {
  it("loads and applies question on success", async () => {
    const load = vi.fn<() => Promise<string>>().mockResolvedValueOnce("q1");
    const pushLoadedQuestion = vi.fn<(question: string) => boolean>().mockReturnValueOnce(true);
    const onError = vi.fn<(error: unknown) => void>();

    await loadAndApplyQuestion({
      load,
      pushLoadedQuestion,
      onError,
    });

    expect(load).toHaveBeenCalledTimes(1);
    expect(pushLoadedQuestion).toHaveBeenCalledWith("q1");
    expect(onError).not.toHaveBeenCalled();
  });

  it("calls onError when persist/apply fails", async () => {
    const load = vi.fn<() => Promise<string>>().mockResolvedValueOnce("q1");
    const pushLoadedQuestion = vi.fn<(question: string) => boolean>().mockReturnValueOnce(false);
    const onError = vi.fn<(error: unknown) => void>();

    await loadAndApplyQuestion({
      load,
      pushLoadedQuestion,
      onError,
    });

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("calls onError when loader throws", async () => {
    const error = new Error("load failed");
    const load = vi.fn<() => Promise<string>>().mockRejectedValueOnce(error);
    const pushLoadedQuestion = vi.fn<(question: string) => boolean>();
    const onError = vi.fn<(error: unknown) => void>();

    await loadAndApplyQuestion({
      load,
      pushLoadedQuestion,
      onError,
    });

    expect(pushLoadedQuestion).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(error);
  });

  it("ignores success result when shouldIgnoreResult is true", async () => {
    const load = vi.fn<() => Promise<string>>().mockResolvedValueOnce("q1");
    const pushLoadedQuestion = vi.fn<(question: string) => boolean>();
    const onError = vi.fn<(error: unknown) => void>();

    await loadAndApplyQuestion({
      load,
      pushLoadedQuestion,
      onError,
      shouldIgnoreResult: () => true,
    });

    expect(pushLoadedQuestion).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it("ignores error result when shouldIgnoreResult is true", async () => {
    const load = vi.fn<() => Promise<string>>().mockRejectedValueOnce(new Error("x"));
    const pushLoadedQuestion = vi.fn<(question: string) => boolean>();
    const onError = vi.fn<(error: unknown) => void>();

    await loadAndApplyQuestion({
      load,
      pushLoadedQuestion,
      onError,
      shouldIgnoreResult: () => true,
    });

    expect(onError).not.toHaveBeenCalled();
  });
});
