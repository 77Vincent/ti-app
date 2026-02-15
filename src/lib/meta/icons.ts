import {
  BookOpenCheck,
  Crown,
  GraduationCap,
  Flame,
  Languages as LanguagesIcon,
  Calculator as MathematicsIcon,
  Computer as ComputerScienceIcon,
  Leaf,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { DifficultyEnum } from "./difficulties";
import type { GoalEnum } from "./goals";
import type { SubjectEnum } from "./subjects";

const DIFFICULTY_ICON_BY_ID: Record<DifficultyEnum, LucideIcon> = {
  beginner: Leaf,
  intermediate: TrendingUp,
  advanced: Flame,
  expert: Crown,
};

const SUBJECT_ICON_BY_ID: Record<SubjectEnum, LucideIcon> = {
  language: LanguagesIcon,
  mathematics: MathematicsIcon,
  "computer-science": ComputerScienceIcon,
};

const GOAL_ICON_BY_ID: Record<GoalEnum, LucideIcon> = {
  study: GraduationCap,
  exam: BookOpenCheck,
};

export function getDifficultyIcon(id: DifficultyEnum): LucideIcon {
  return DIFFICULTY_ICON_BY_ID[id];
}

export function getSubjectIcon(id: SubjectEnum): LucideIcon {
  return SUBJECT_ICON_BY_ID[id];
}

export function getGoalIcon(id: GoalEnum): LucideIcon {
  return GOAL_ICON_BY_ID[id];
}
