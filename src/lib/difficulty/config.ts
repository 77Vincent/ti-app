import type { SubcategoryEnum } from "@/lib/meta";

export const DIFFICULTY_LADDER_BY_SUBCATEGORY = {
  english: ["<A1", "A1", "A2", "B1", "B2", "C1", "C2"],
} as const satisfies Record<SubcategoryEnum, readonly string[]>;

export const DIFFICULTY_ADAPTIVE_WINDOW_SIZE = 10;
export const DIFFICULTY_PROMOTE_ACCURACY_THRESHOLD = 0.8;
export const DIFFICULTY_DEMOTE_ACCURACY_THRESHOLD = 0.5;
export const DIFFICULTY_LEVEL_CHANGE_COOLDOWN_SUBMISSIONS = 5;
