import { beforeEach, describe, expect, it, vi } from "vitest";
import { QUESTION_TYPES } from "@/lib/meta";

const {
  favoriteQuestionDeleteMany,
  favoriteQuestionFindUnique,
  favoriteQuestionUpsert,
} = vi.hoisted(() => ({
  favoriteQuestionDeleteMany: vi.fn(),
  favoriteQuestionFindUnique: vi.fn(),
  favoriteQuestionUpsert: vi.fn(),
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

import {
  deleteFavoriteQuestion,
  isQuestionFavorited,
  upsertFavoriteQuestion,
} from "./repo";

const VALID_INPUT = {
  questionId: "question-1",
  subjectId: "language",
  subcategoryId: "english",
  questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
  prompt: "What is the capital of France?",
  options: [
    { text: "Berlin", explanation: "Wrong." },
    { text: "Paris", explanation: "Correct." },
    { text: "Madrid", explanation: "Wrong." },
  ],
  correctOptionIndexes: [1],
} as const;

describe("favorite question repo", () => {
  beforeEach(() => {
    favoriteQuestionDeleteMany.mockReset();
    favoriteQuestionFindUnique.mockReset();
    favoriteQuestionUpsert.mockReset();
  });

  it("upserts favorite mapping", async () => {
    favoriteQuestionUpsert.mockResolvedValueOnce(undefined);

    await upsertFavoriteQuestion("user-1", VALID_INPUT);

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
