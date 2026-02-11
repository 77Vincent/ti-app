import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  buildQuestion,
  incrementAnonymousQuestionCountCookie,
  parseTestRunParams,
  readAnonymousQuestionCount,
  readAuthenticatedUserId,
} = vi.hoisted(() => ({
  buildQuestion: vi.fn(),
  incrementAnonymousQuestionCountCookie: vi.fn((response: Response) => response),
  parseTestRunParams: vi.fn(),
  readAnonymousQuestionCount: vi.fn(),
  readAuthenticatedUserId: vi.fn(),
}));

vi.mock("@/lib/validation/testSession", () => ({
  parseTestRunParams,
}));

vi.mock("@/app/api/test/session/auth", () => ({
  readAuthenticatedUserId,
}));

vi.mock("./cookie/anonymousCount", () => ({
  incrementAnonymousQuestionCountCookie,
  readAnonymousQuestionCount,
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
    incrementAnonymousQuestionCountCookie.mockReset();
    readAuthenticatedUserId.mockReset();
    parseTestRunParams.mockReset();
    readAnonymousQuestionCount.mockReset();

    parseTestRunParams.mockReturnValue(VALID_INPUT);
    buildQuestion.mockResolvedValue({ id: "question-1" });
    incrementAnonymousQuestionCountCookie.mockImplementation(
      (response: Response) => response,
    );
    readAuthenticatedUserId.mockResolvedValue(null);
    readAnonymousQuestionCount.mockResolvedValue(0);
  });

  it("increments anonymous question count when request succeeds", async () => {
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
    expect(incrementAnonymousQuestionCountCookie).toHaveBeenCalledWith(
      expect.any(Response),
      0,
    );
  });

  it("blocks anonymous request after 5 questions", async () => {
    readAnonymousQuestionCount.mockResolvedValue(5);

    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/generate", {
        body: JSON.stringify(VALID_INPUT),
        method: "POST",
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error:
        "You have reached the anonymous limit of 5 questions. Please log in to continue.",
    });
    expect(buildQuestion).not.toHaveBeenCalled();
    expect(incrementAnonymousQuestionCountCookie).not.toHaveBeenCalled();
  });

  it("does not apply anonymous limit for authenticated users", async () => {
    readAuthenticatedUserId.mockResolvedValue("user-1");

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
    expect(readAnonymousQuestionCount).not.toHaveBeenCalled();
    expect(incrementAnonymousQuestionCountCookie).not.toHaveBeenCalled();
  });
});
