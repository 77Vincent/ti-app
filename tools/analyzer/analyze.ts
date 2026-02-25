import type { QuestionOption, QuestionSubcategory } from "../types";
import { analyzeQuestionWithAI } from "./index";
import {
  deleteQuestionCandidateById,
  persistQuestionCandidateToPool,
  takeNextQuestionCandidate,
} from "../repo";

export type AnalyzeNextQuestionCandidateResult =
  | { status: "empty" }
  | {
      status: "passed" | "rejected";
      questionId: string;
      difficulty: string;
    };

export async function analyzeNextQuestionCandidateWithAI(): Promise<AnalyzeNextQuestionCandidateResult> {
  const questionCandidate = await takeNextQuestionCandidate();
  if (!questionCandidate) {
    return { status: "empty" };
  }

  const subcategory = questionCandidate.subcategoryId as QuestionSubcategory;
  const analysis = await analyzeQuestionWithAI(
    {
      subcategory,
      prompt: questionCandidate.prompt,
      options: questionCandidate.options as unknown as QuestionOption[],
    },
  );

  if (analysis.isAccepted) {
    await persistQuestionCandidateToPool(questionCandidate);
  }

  await deleteQuestionCandidateById(questionCandidate.id);

  return {
    status: analysis.isAccepted ? "passed" : "rejected",
    questionId: questionCandidate.id,
    difficulty: questionCandidate.difficulty,
  };
}
