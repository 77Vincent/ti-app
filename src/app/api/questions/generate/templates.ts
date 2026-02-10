import { QUESTION_TYPES } from "@/lib/meta";
import type { QuestionOption, QuestionOptionId } from "@/modules/questionRunner/types";

type TemplateBase = {
  id: string;
  prompt: string;
  options: QuestionOption[];
};

type MultipleChoiceTemplate = TemplateBase & {
  questionType: typeof QUESTION_TYPES.MULTIPLE_CHOICE;
  correctOptionId: QuestionOptionId;
};

type MultipleAnswerTemplate = TemplateBase & {
  questionType: typeof QUESTION_TYPES.MULTIPLE_ANSWER;
  correctOptionIds: QuestionOptionId[];
};

export type QuestionTemplate = MultipleChoiceTemplate | MultipleAnswerTemplate;

export const TEMPLATE_BY_SUBCATEGORY: Record<string, QuestionTemplate[]> = {
  english: [
    {
      id: "eng-grammar-1",
      questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
      prompt: "Choose the sentence with correct subject-verb agreement.",
      options: [
        { id: "A", text: "They was ready for the exam." },
        { id: "B", text: "They were ready for the exam." },
        { id: "C", text: "They is ready for the exam." },
        { id: "D", text: "They be ready for the exam." },
      ],
      correctOptionId: "B",
    },
    {
      id: "eng-pos-1",
      questionType: QUESTION_TYPES.MULTIPLE_ANSWER,
      prompt: "Select all nouns in: \"The bright stars lit the sky.\"",
      options: [
        { id: "A", text: "bright" },
        { id: "B", text: "stars" },
        { id: "C", text: "lit" },
        { id: "D", text: "sky" },
      ],
      correctOptionIds: ["B", "D"],
    },
  ],
};
