import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  buildQuestion,
  parseTestParam,
} = vi.hoisted(() => ({
  buildQuestion: vi.fn(),
  parseTestParam: vi.fn(),
}));

vi.mock("@/lib/validation/testSession", () => ({
  parseTestParam,
}));

vi.mock("./service/question", () => ({
  buildQuestion,
}));

const VALID_INPUT = {
  difficulty: "beginner",
  goal: "study",
  subjectId: "language",
  subcategoryId: "english",
};

describe("generate question route", () => {
  beforeEach(() => {
    vi.resetModules();
    buildQuestion.mockReset();
    parseTestParam.mockReset();

    parseTestParam.mockReturnValue(VALID_INPUT);
    buildQuestion.mockResolvedValue({ id: "question-1" });
  });

  it("returns question when request succeeds", async () => {
    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/generate", {
        body: JSON.stringify(VALID_INPUT),
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      question: { id: "question-1" },
    });
    expect(buildQuestion).toHaveBeenCalledWith(VALID_INPUT);
  });

  it("returns 400 for invalid request payload", async () => {
    parseTestParam.mockReturnValueOnce(null);

    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/generate", {
        body: JSON.stringify(VALID_INPUT),
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "subjectId, subcategoryId, difficulty, and goal are required.",
    });
    expect(buildQuestion).not.toHaveBeenCalled();
  });

  it("returns 500 when question generation throws", async () => {
    buildQuestion.mockRejectedValueOnce(new Error("provider down"));

    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/generate", {
        body: JSON.stringify(VALID_INPUT),
        method: "POST",
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "provider down",
    });
  });
});
