import { type DifficultyEnum, type SubjectEnum } from "@/lib/meta";
import { DIFFICULTY_MAP, DifficultyStandard } from "./config";

export function getDifficulty(
  subjectId: SubjectEnum,
  subcategoryId: string,
  difficulty: DifficultyEnum,
): DifficultyStandard | null {
  return DIFFICULTY_MAP[subjectId]?.[subcategoryId]?.[difficulty] ?? null;
}
