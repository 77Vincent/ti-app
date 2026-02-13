import { beforeEach, describe, expect, it, vi } from "vitest";
import { QUESTION_TYPES } from "@/lib/meta";

const {
  favoriteQuestionDeleteMany,
  favoriteQuestionFindUnique,
  favoriteQuestionUpsert,
  upsertQuestionPool,
} = vi.hoisted(() => ({
  favoriteQuestionDeleteMany: vi.fn(),
  favoriteQuestionFindUnique: vi.fn(),
  favoriteQuestionUpsert: vi.fn(),
  upsertQuestionPool: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    favoriteQuestion: {
      deleteMany: favoriteQuestionDeleteMany,
      findUnique: favoriteQuestionFindUnique,
      upsert: favoriteQuestionUpsert,
    },
  },
}));

vi.mock("../pool/repo", () => ({
  upsertQuestionPool,
}));

import {
  deleteFavoriteQuestion,
  isQuestionFavorited,
  upsertFavoriteQuestion,
} from "./repo";

const VALID_INPUT = {
  questionId: "question-1",
  subjectId: "language",
  subcategoryId: "english",
  difficulty: "beginner",
  questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
  prompt: "What is the capital of France?",
  options: [
    { id: "A", text: "Berlin", explanation: "Wrong." },
    { id: "B", text: "Paris", explanation: "Correct." },
  ],
  correctOptionIds: ["B"],
} as const;

describe("favorite question repo", () => {
  beforeEach(() => {
    favoriteQuestionDeleteMany.mockReset();
    favoriteQuestionFindUnique.mockReset();
    favoriteQuestionUpsert.mockReset();
    upsertQuestionPool.mockReset();
  });

  it("upserts question pool first, then favorite mapping", async () => {
    upsertQuestionPool.mockResolvedValueOnce(undefined);
    favoriteQuestionUpsert.mockResolvedValueOnce(undefined);

    await upsertFavoriteQuestion("user-1", VALID_INPUT);

    expect(upsertQuestionPool).toHaveBeenCalledWith({
      id: "question-1",
      subjectId: "language",
      subcategoryId: "english",
      difficulty: "beginner",
      questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
      prompt: "What is the capital of France?",
      options: VALID_INPUT.options,
      correctOptionIds: ["B"],
    });
    expect(favoriteQuestionUpsert).toHaveBeenCalledWith({
      where: {
        userId_questionId: {
          userId: "user-1",
          questionId: "question-1",
        },
      },
      create: {
        userId: "user-1",
        questionId: "question-1",
      },
      update: {},
    });
    expect(upsertQuestionPool.mock.invocationCallOrder[0]).toBeLessThan(
      favoriteQuestionUpsert.mock.invocationCallOrder[0],
    );
  });

  it("deletes favorite question by user and question id", async () => {
    favoriteQuestionDeleteMany.mockResolvedValueOnce({ count: 1 });

    await deleteFavoriteQuestion("user-1", "question-1");

    expect(favoriteQuestionDeleteMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        questionId: "question-1",
      },
    });
  });

  it("returns true when favorite exists", async () => {
    favoriteQuestionFindUnique.mockResolvedValueOnce({ questionId: "question-1" });

    await expect(isQuestionFavorited("user-1", "question-1")).resolves.toBe(true);

    expect(favoriteQuestionFindUnique).toHaveBeenCalledWith({
      where: {
        userId_questionId: {
          userId: "user-1",
          questionId: "question-1",
        },
      },
      select: {
        questionId: true,
      },
    });
  });

  it("returns false when favorite does not exist", async () => {
    favoriteQuestionFindUnique.mockResolvedValueOnce(null);

    await expect(isQuestionFavorited("user-1", "question-1")).resolves.toBe(false);
  });
});
