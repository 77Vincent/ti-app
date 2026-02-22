import { afterEach, describe, expect, it, vi } from "vitest";
import { requestDeepSeekQuestionContent } from "./client";

const VALID_INPUT = {
  subjectId: "language",
  subcategoryId: "english",
} as const;

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

describe("requestDeepSeekQuestionContent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.AI_API_KEY;
    delete process.env.AI_MODEL;
  });

  it("throws when AI_API_KEY is missing", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(requestDeepSeekQuestionContent(VALID_INPUT)).rejects.toThrow(
      "AI_API_KEY is not configured.",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("calls DeepSeek and returns message content", async () => {
    process.env.AI_API_KEY = "test-key";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "{\"ok\":true}",
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await expect(requestDeepSeekQuestionContent(VALID_INPUT)).resolves.toBe(
      '{"ok":true}',
    );

    const [, options] = fetchSpy.mock.calls[0] ?? [];
    const body =
      options && typeof options === "object" && "body" in options
        ? (options as { body?: string }).body
        : undefined;

    expect(globalThis.fetch).toHaveBeenCalledWith(
      DEEPSEEK_URL,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
          "Content-Type": "application/json",
        }),
        method: "POST",
      }),
    );
    expect(body).toContain("array length must be exactly 2");
    expect(body).toContain("each question item must use only keys p, d, o, a");
  });

  it("throws provider error for non-ok response", async () => {
    process.env.AI_API_KEY = "test-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: { message: "provider down" },
        }),
        { status: 500 },
      ),
    );

    await expect(requestDeepSeekQuestionContent(VALID_INPUT)).rejects.toThrow(
      "provider down",
    );
  });

  it("throws when provider content is empty", async () => {
    process.env.AI_API_KEY = "test-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "",
              },
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await expect(requestDeepSeekQuestionContent(VALID_INPUT)).rejects.toThrow(
      "AI provider returned empty content.",
    );
  });
});
