import type { SubcategoryEnum } from "@/lib/meta";

type DifficultyProfile = {
  framework: string;
  ladder: readonly string[];
  description: Record<string, string>;
};

export const DIFFICULTY_LADDER_BY_SUBCATEGORY: Record<
  SubcategoryEnum,
  DifficultyProfile
> = {
  english: {
    framework: "CEFR",
    ladder: ["A1", "A2", "B1", "B2", "C1", "C2"],
    description: {
      A1: "Can understand and use familiar everyday expressions and very basic phrases for immediate needs.",
      A2: "Can understand common sentences on everyday topics and communicate in simple, routine tasks.",
      B1: "Can understand main points of clear standard input and handle most situations while traveling.",
      B2: "Can understand complex text and interact with fluency and spontaneity on a broad range of topics.",
      C1: "Can use language flexibly and effectively for social, academic, and professional purposes.",
      C2: "Can understand virtually everything heard or read and express ideas precisely in complex situations.",
    },
  },
  japanese: {
    framework: "JLPT",
    ladder: ["N5", "N4", "N3", "N2", "N1"],
    description: {
      N5: "Can understand and use basic phrases and expressions for everyday situations.",
      N4: "Can understand and use basic Japanese in familiar contexts, such as daily life and work.",
      N3: "Can understand and use Japanese in a variety of situations, including some complex ones.",
      N2: "Can understand and use Japanese in a wide range of contexts, including more complex ones.",
      N1: "Can understand and use Japanese at an advanced level, including abstract topics and nuanced expressions.",
    },
  },
  chinese: {
    framework: "HSK",
    ladder: ["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"],
    description: {
      HSK1: "Can understand and use very simple Chinese phrases for basic communication.",
      HSK2: "Can understand and use simple Chinese sentences for everyday communication.",
      HSK3: "Can understand and use Chinese in a variety of situations, including some complex ones.",
      HSK4: "Can understand and use Chinese in a wide range of contexts, including more complex ones.",
      HSK5: "Can understand and use Chinese at an advanced level, including abstract topics and nuanced expressions.",
      HSK6: "Can understand and use Chinese fluently and accurately in all contexts, including academic and professional settings.",
    },
  },
} as const;
