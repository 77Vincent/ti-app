"use client";

import type { Question, QuestionOptionIndex } from "../types";
import {
  isOptionCorrect,
  isOptionWrongSelection,
} from "../utils/evaluation";
import QuestionChoice from "./QuestionChoice";
import QuestionPrompt from "./QuestionPrompt";

type QuestionBodyProps = {
  question: Question;
  hasSubmitted: boolean;
  selectedOptionIndexes: QuestionOptionIndex[];
  onSelectOption: (optionIndex: QuestionOptionIndex) => void;
  markAllIncorrectAsWrong?: boolean;
  showPrompt?: boolean;
  showReadPromptButton?: boolean;
  readPromptLanguage?: string;
};

export default function QuestionBody({
  question,
  hasSubmitted,
  selectedOptionIndexes,
  onSelectOption,
  markAllIncorrectAsWrong = false,
  showPrompt = true,
  showReadPromptButton = false,
  readPromptLanguage,
}: QuestionBodyProps) {
  return (
    <div className="space-y-5">
      {showPrompt ? (
        <QuestionPrompt
          markdown={question.prompt}
          readLanguage={readPromptLanguage}
          showReadButton={showReadPromptButton}
        />
      ) : null}

      <div className="space-y-4">
        {question.options.map((option, optionIndex) => {
          const isSelected = selectedOptionIndexes.includes(optionIndex);
          const isCorrect = isOptionCorrect(question, optionIndex);
          const isWrongSelection = markAllIncorrectAsWrong
            ? !isCorrect
            : hasSubmitted && isOptionWrongSelection(question, selectedOptionIndexes, optionIndex);

          return (
            <QuestionChoice
              hasSubmitted={hasSubmitted}
              isCorrect={isCorrect}
              isSelected={isSelected}
              isWrongSelection={isWrongSelection}
              key={optionIndex}
              onSelect={() => onSelectOption(optionIndex)}
              option={option}
            />
          );
        })}
      </div>
    </div>
  );
}
