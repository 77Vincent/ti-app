export type QuestionOptionIndex = number;

export type QuestionOption = {
  text: string;
  explanation: string;
};

export type Question = {
  id: string;
  prompt: string;
  difficulty: string;
  options: QuestionOption[];
  correctOptionIndexes: QuestionOptionIndex[];
};
