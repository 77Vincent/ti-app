import {
  Languages as LanguagesIcon,
  Calculator as MathIcon,
  Code as ProgrammingIcon,
  Puzzle as LogicIcon,
  type LucideIcon,
} from "lucide-react";
import type { SubjectEnum } from "./subjects";

const SUBJECT_ICON_BY_ID: Record<SubjectEnum, LucideIcon> = {
  language: LanguagesIcon,
  math: MathIcon,
  programming: ProgrammingIcon,
  logic: LogicIcon,
};

export function getSubjectIcon(id: SubjectEnum): LucideIcon {
  return SUBJECT_ICON_BY_ID[id];
}
