import type { TestRunSession } from "@/lib/validation/testSession";

type QuestionSessionKeyInput = Pick<
  TestRunSession,
  "startedAtMs" | "subjectId" | "subcategoryId" | "difficulty" | "goal"
>;

export function buildQuestionSessionKey({
  startedAtMs,
  subjectId,
  subcategoryId,
  difficulty,
  goal,
}: QuestionSessionKeyInput): string {
  return `${startedAtMs}:${subjectId}:${subcategoryId}:${difficulty}:${goal}`;
}
