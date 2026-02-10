"use client";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import type { QuestionOption } from "./types";

type QuestionChoiceProps = {
  option: QuestionOption;
  hasSubmitted: boolean;
  isSubmitting: boolean;
  isSelected: boolean;
  isCorrect: boolean;
  isWrongSelection: boolean;
  onSelect: () => void;
};

function renderInlineMarkdown(markdown: string) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <span>{children}</span>,
      }}
      rehypePlugins={[rehypeKatex]}
      remarkPlugins={[remarkMath]}
    >
      {markdown}
    </ReactMarkdown>
  );
}

export default function QuestionChoice({
  option,
  hasSubmitted,
  isSubmitting,
  isSelected,
  isCorrect,
  isWrongSelection,
  onSelect,
}: QuestionChoiceProps) {
  const buttonClassName = hasSubmitted
    ? isCorrect
      ? "btn-success"
      : isWrongSelection
        ? "btn-error"
        : "btn-outline"
    : isSelected
      ? "btn-primary"
      : "btn-outline";

  return (
    <div className="space-y-1">
      <button
        className={`btn w-full justify-start ${buttonClassName}`}
        disabled={isSubmitting}
        onClick={onSelect}
        type="button"
      >
        <span className="font-mono">{option.id}.</span>
        <span>{renderInlineMarkdown(option.text)}</span>
      </button>

      {hasSubmitted ? (
        <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
          {option.explanation}
        </ReactMarkdown>
      ) : null}
    </div>
  );
}
