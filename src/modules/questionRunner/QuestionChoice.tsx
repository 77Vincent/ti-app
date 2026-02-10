"use client";

import { Card, CardBody } from "@heroui/react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import type { QuestionOption } from "./types";

type QuestionChoiceProps = {
  option: QuestionOption;
  hasSubmitted: boolean;
  isMultipleAnswer: boolean;
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
  isMultipleAnswer,
  isSubmitting,
  isSelected,
  isCorrect,
  isWrongSelection,
  onSelect,
}: QuestionChoiceProps) {
  const isMissedCorrect =
    hasSubmitted && isMultipleAnswer && isCorrect && !isSelected;

  const containerClassName = hasSubmitted
    ? isCorrect
      ? isMissedCorrect
        ? "border-amber-500 bg-amber-50 text-amber-900"
        : "border-emerald-500 bg-emerald-50 text-emerald-900"
      : isWrongSelection
        ? "border-red-500 bg-red-50 text-red-900"
        : "border-default-300 bg-default-50 text-foreground"
    : isSelected
      ? "border-primary bg-primary-50 text-foreground"
      : "border-default-300 bg-background text-foreground";

  return (
    <div className="space-y-1">
      <Card
        className={`border-medium ${containerClassName}`}
        isDisabled={isSubmitting || hasSubmitted}
        isPressable={!hasSubmitted}
        onPress={onSelect}
      >
        <CardBody className="px-4 py-3 text-left leading-relaxed">
          <span className="font-mono">{option.id}. </span>
          <span>{renderInlineMarkdown(option.text)}</span>
        </CardBody>
      </Card>

      {hasSubmitted ? (
        <Card className="border-default-200 bg-default-100" radius="sm">
          <CardBody className="px-4 py-2 text-sm leading-relaxed">
          <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
            {option.explanation}
          </ReactMarkdown>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
