import { beforeEach, describe, expect, it, vi } from "vitest";
import { takeNextQuestionPool } from "./pool";

const { countMock, findFirstMock } = vi.hoisted(() => ({
  countMock: vi.fn(),
  findFirstMock: vi.fn(),
}));

vi.mock("./prisma", () => ({
  prisma: {
    questionPool: {
      count: countMock,
      findFirst: findFirstMock,
    },
  },
}));

describe("takeNextQuestionPool", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    countMock.mockReset();
    findFirstMock.mockReset();
  });

  it("returns null when pool has no rows", async () => {
    countMock.mockResolvedValue(0);

    const result = await takeNextQuestionPool();

    expect(result).toBeNull();
    expect(countMock).toHaveBeenCalledWith();
    expect(findFirstMock).not.toHaveBeenCalled();
  });

  it("samples a random row using skip offset", async () => {
    countMock.mockResolvedValue(10);
    findFirstMock.mockResolvedValue({ id: "q-7" });
    vi.spyOn(Math, "random").mockReturnValue(0.7);

    const result = await takeNextQuestionPool();

    expect(result).toEqual({ id: "q-7" });
    expect(findFirstMock).toHaveBeenCalledWith({
      orderBy: { id: "asc" },
      skip: 7,
    });
  });
});
