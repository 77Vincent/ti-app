import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  favoriteQuestionDeleteMany,
  favoriteQuestionFindMany,
  favoriteQuestionFindUnique,
  favoriteQuestionUpsert,
} = vi.hoisted(() => ({
  favoriteQuestionDeleteMany: vi.fn(),
  favoriteQuestionFindMany: vi.fn(),
  favoriteQuestionFindUnique: vi.fn(),
  favoriteQuestionUpsert: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    favoriteQuestion: {
      deleteMany: favoriteQuestionDeleteMany,
      findMany: favoriteQuestionFindMany,
      findUnique: favoriteQuestionFindUnique,
      upsert: favoriteQuestionUpsert,
    },
  },
}));

import {
  deleteFavoriteQuestion,
  isQuestionFavorited,
  readFavoriteQuestions,
  upsertFavoriteQuestion,
} from "./repo";

describe("favorite question repo", () => {
  beforeEach(() => {
    favoriteQuestionDeleteMany.mockReset();
    favoriteQuestionFindMany.mockReset();
    favoriteQuestionFindUnique.mockReset();
    favoriteQuestionUpsert.mockReset();
  });

  it("upserts favorite mapping", async () => {
    favoriteQuestionUpsert.mockResolvedValueOnce(undefined);

    await upsertFavoriteQuestion("user-1", "question-1");

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

  it("reads favorite questions by subject and subcategory", async () => {
    favoriteQuestionFindMany.mockResolvedValueOnce([
      {
        question: {
          id: "question-2",
          prompt: "Prompt 2",
          difficulty: "A2",
          correctOptionIndexes: [1],
          options: [
            { text: "Option 2-1", explanation: "Explanation 2-1" },
            { text: "Option 2-2", explanation: "Explanation 2-2" },
          ],
        },
      },
      {
        question: {
          id: "question-1",
          prompt: "Prompt 1",
          difficulty: "A1",
          correctOptionIndexes: [0],
          options: [{ text: "Option 1-1", explanation: "Explanation 1-1" }],
        },
      },
    ]);

    await expect(
      readFavoriteQuestions("user-1", "language", "english"),
    ).resolves.toEqual([
      {
        id: "question-2",
        prompt: "Prompt 2",
        difficulty: "A2",
        correctOptionIndexes: [1],
        options: [
          { text: "Option 2-1", explanation: "Explanation 2-1" },
          { text: "Option 2-2", explanation: "Explanation 2-2" },
        ],
      },
      {
        id: "question-1",
        prompt: "Prompt 1",
        difficulty: "A1",
        correctOptionIndexes: [0],
        options: [{ text: "Option 1-1", explanation: "Explanation 1-1" }],
      },
    ]);

    expect(favoriteQuestionFindMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        question: {
          subjectId: "language",
          subcategoryId: "english",
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        question: {
          select: {
            id: true,
            prompt: true,
            difficulty: true,
            correctOptionIndexes: true,
            options: true,
          },
        },
      },
    });
  });

  it("reads favorite questions by subject without subcategory", async () => {
    favoriteQuestionFindMany.mockResolvedValueOnce([]);

    await expect(
      readFavoriteQuestions("user-1", "language"),
    ).resolves.toEqual([]);

    expect(favoriteQuestionFindMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        question: {
          subjectId: "language",
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        question: {
          select: {
            id: true,
            prompt: true,
            difficulty: true,
            correctOptionIndexes: true,
            options: true,
          },
        },
      },
    });
  });
});
