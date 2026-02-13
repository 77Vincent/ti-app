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
  },
};
