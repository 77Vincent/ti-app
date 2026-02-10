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
  const containerClassName = hasSubmitted
    ? isCorrect
      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
      : isWrongSelection
        ? "border-red-500 bg-red-50 text-red-900"
        : "border-base-300 bg-base-100 text-base-content"
    : isSelected
      ? "border-primary bg-primary/10 text-base-content"
      : "border-base-300 bg-base-100 text-base-content hover:bg-base-200";

  return (
    <div className="space-y-1">
      <button
        className={`w-full cursor-pointer rounded-lg border px-4 py-2 text-left font-normal leading-relaxed transition-colors ${containerClassName}`}
        disabled={isSubmitting}
        onClick={onSelect}
        type="button"
      >
        <span className="font-mono">{option.id}. </span>
        <span>{renderInlineMarkdown(option.text)}</span>
      </button>

      {hasSubmitted ? (
        <div className="text-sm border border-base-300 rounded-lg px-4 py-2 bg-base-200 leading-relaxed">
          <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
            {option.explanation}
          </ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
}
