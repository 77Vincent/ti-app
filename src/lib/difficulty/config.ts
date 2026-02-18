import {
  type DifficultyEnum,
  type SubjectEnum,
  type SubcategoryEnum,
} from "@/lib/meta";

export type DifficultyStandard = {
  framework: string;
  level: string;
};

export const DIFFICULTY_MAP: Partial<
  Record<
    SubjectEnum,
    Partial<Record<SubcategoryEnum, Partial<Record<DifficultyEnum, DifficultyStandard>>>>
  >
> = {
  language: {
    english: {
      beginner: { framework: "CEFR", level: "A1-A2" },
      intermediate: { framework: "CEFR", level: "B1-B2" },
      advanced: { framework: "CEFR", level: "C1" },
      expert: { framework: "CEFR", level: "C2" },
    },
    japanese: {
      beginner: { framework: "JLPT", level: "N5-N4" },
      intermediate: { framework: "JLPT", level: "N3" },
      advanced: { framework: "JLPT", level: "N2" },
      expert: { framework: "JLPT", level: "N1" },
    },
  },
  mathematics: {
    "linear-algebra": {
      beginner: { framework: "AP Math", level: "Precalculus Foundations" },
      intermediate: { framework: "AP Math", level: "AP Precalculus" },
      advanced: { framework: "AP Math", level: "AP Calculus AB" },
      expert: { framework: "AP Math", level: "AP Calculus BC" },
    },
  },
};
