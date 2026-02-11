import {
  Crown,
  Flame,
  Languages,
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
  language: Languages,
};

export function getDifficultyIcon(id: string): LucideIcon | null {
  if (!(id in DIFFICULTY_ICON_BY_ID)) {
    return null;
  }

  return DIFFICULTY_ICON_BY_ID[id as DifficultyEnum];
}

export function getSubjectIcon(id: string): LucideIcon | null {
  if (!(id in SUBJECT_ICON_BY_ID)) {
    return null;
  }

  return SUBJECT_ICON_BY_ID[id as SubjectEnum];
}
