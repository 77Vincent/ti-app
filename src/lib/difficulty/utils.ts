import type { SubcategoryEnum } from "@/lib/meta";
import { DIFFICULTY_LADDER_BY_SUBCATEGORY } from "./config";

export function getInitialDifficultyForSubcategory(
  subcategoryId: SubcategoryEnum,
): string {
  return DIFFICULTY_LADDER_BY_SUBCATEGORY[subcategoryId][0];
}

export function isDifficultyAllowedForSubcategory(
  subcategoryId: SubcategoryEnum,
  difficulty: string,
): boolean {
  const ladder = DIFFICULTY_LADDER_BY_SUBCATEGORY[subcategoryId] as readonly string[];
  return ladder.includes(difficulty);
}
