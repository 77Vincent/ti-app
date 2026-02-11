import { QUESTION_TYPES } from "@/lib/meta";
import type { TestRunParams as GenerateQuestionRequest } from "@/app/test/run/questionRunner/session/params";
import type { Question } from "@/app/test/run/questionRunner/types";

function createMockQuestionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `mock-${Math.random().toString(36).slice(2, 10)}`;
}

export function generateMockQuestion(input: GenerateQuestionRequest): Question {
  return {
    id: createMockQuestionId(),
    questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
    prompt: `**Mock question** (${input.subjectId} / ${input.subcategoryId} / ${input.difficulty} / ${input.goal})\n\nWhat is the capital of France?`,
    options: [
      {
        id: "A",
        text: "Berlin",
        explanation: "Berlin is the capital of Germany.",
      },
      {
        id: "B",
        text: "Paris",
        explanation: "Paris is the capital of France.",
      },
      {
        id: "C",
        text: "Madrid",
        explanation: "Madrid is the capital of Spain.",
      },
      {
        id: "D",
        text: "Rome",
        explanation: "Rome is the capital of Italy.",
      },
    ],
    correctOptionIds: ["B"],
  };
}
