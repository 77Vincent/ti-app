import {
  Languages as LanguagesIcon,
  type LucideIcon,
} from "lucide-react";
import type { SubjectEnum } from "./subjects";

const SUBJECT_ICON_BY_ID: Record<SubjectEnum, LucideIcon> = {
  language: LanguagesIcon,
};

export function getSubjectIcon(id: SubjectEnum): LucideIcon {
  return SUBJECT_ICON_BY_ID[id];
}
