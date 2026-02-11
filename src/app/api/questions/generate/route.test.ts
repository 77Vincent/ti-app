import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  cookieGet,
  cookiesFn,
  generateMockQuestion,
  parseTestRunParams,
  readAuthenticatedUserId,
} = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookiesFn: vi.fn(async () => ({
    get: cookieGet,
  })),
  generateMockQuestion: vi.fn(),
  parseTestRunParams: vi.fn(),
  readAuthenticatedUserId: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesFn,
}));

vi.mock("./ai", () => ({
  generateQuestionWithAI: vi.fn(),
}));

vi.mock("./mock", () => ({
  generateMockQuestion,
}));

vi.mock("@/app/test/run/questionRunner/session/params", () => ({
  parseTestRunParams,
}));

vi.mock("@/app/api/test/session/auth", () => ({
  readAuthenticatedUserId,
}));

const VALID_INPUT = {
  difficulty: "beginner",
  subjectId: "language",
  subcategoryId: "english",
};

describe("generate question route", () => {
  beforeEach(() => {
    vi.resetModules();
    cookieGet.mockReset();
    cookiesFn.mockClear();
    readAuthenticatedUserId.mockReset();
    generateMockQuestion.mockReset();
    parseTestRunParams.mockReset();

    parseTestRunParams.mockReturnValue(VALID_INPUT);
    generateMockQuestion.mockReturnValue({ id: "mock-question" });
    readAuthenticatedUserId.mockResolvedValue(null);
    cookieGet.mockReturnValue(undefined);
    delete process.env.OPENAI_API_KEY;
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
      question: { id: "mock-question" },
    });
    expect(response.headers.get("set-cookie")).toContain(
      "ti-app-anon-question-count=1",
    );
  });

  it("blocks anonymous request after 5 questions", async () => {
    cookieGet.mockImplementation((cookieName: string) => {
      if (cookieName !== "ti-app-anon-question-count") {
        return undefined;
      }

      return { value: "5" };
    });

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
    expect(generateMockQuestion).not.toHaveBeenCalled();
  });

  it("does not apply anonymous limit for authenticated users", async () => {
    readAuthenticatedUserId.mockResolvedValue("user-1");
    cookieGet.mockImplementation(() => ({ value: "5" }));

    const route = await import("./route");

    const response = await route.POST(
      new Request("http://localhost/api/questions/generate", {
        body: JSON.stringify(VALID_INPUT),
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      question: { id: "mock-question" },
    });
    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
