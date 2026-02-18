import type { DifficultyEnum, SubjectEnum } from "../meta";
import { QUESTION_STYLES } from "./config";

const QUESTION_STYLE_CURSOR_BY_SUBJECT: Partial<
  Record<
    SubjectEnum,
    Partial<Record<DifficultyEnum, number>>
  >
> = {};

export function getQuestionStyle(input: { subjectId: SubjectEnum; difficulty: DifficultyEnum }): string {
  const styles = QUESTION_STYLES[input.subjectId]?.[input.difficulty];
  if (!styles?.length) {
    return "fill-in-the-blank"; // default style
  }

  const subjectCursor =
    QUESTION_STYLE_CURSOR_BY_SUBJECT[input.subjectId] ??
    (QUESTION_STYLE_CURSOR_BY_SUBJECT[input.subjectId] = {});
  const cursor = subjectCursor[input.difficulty] ?? 0;
  const index = cursor % styles.length;
  subjectCursor[input.difficulty] = cursor + 1;
  return styles[index] ?? styles[0];
}
