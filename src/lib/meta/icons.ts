import {
  Crown,
  Flame,
  Languages as LanguagesIcon,
  Leaf,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { DifficultyEnum } from "./difficulties";
import type { SubjectEnum } from "./subjects";

const DIFFICULTY_ICON_BY_ID: Record<DifficultyEnum, LucideIcon> = {
  beginner: Leaf,
  intermediate: TrendingUp,
  advanced: Flame,
  expert: Crown,
};

const SUBJECT_ICON_BY_ID: Record<SubjectEnum, LucideIcon> = {
  language: LanguagesIcon,
};

export function getDifficultyIcon(id: DifficultyEnum): LucideIcon {
  return DIFFICULTY_ICON_BY_ID[id];
}

export function getSubjectIcon(id: SubjectEnum): LucideIcon {
  return SUBJECT_ICON_BY_ID[id];
}
