import {
  type DifficultyEnum,
  type SubjectEnum,
  type SubcategoryEnum,
} from "@/lib/meta";
import { DIFFICULTY_MAP, type DifficultyStandard } from "./config";

export function getDifficulty(
  subjectId: SubjectEnum,
  subcategoryId: SubcategoryEnum,
  difficulty: DifficultyEnum,
): DifficultyStandard | null {
  return DIFFICULTY_MAP[subjectId]?.[subcategoryId]?.[difficulty] ?? null;
}
