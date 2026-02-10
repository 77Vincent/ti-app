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
        ? "border-amber-500 bg-amber-50"
        : "border-emerald-500 bg-emerald-50"
      : isWrongSelection
        ? "border-red-500 bg-red-50"
        : "border-default-300 bg-default-50"
    : isSelected
      ? "border-primary bg-primary-50"
      : "border-default-300 bg-background";

  return (
    <div className="space-y-1">
      <Card
        shadow="none"
        className={`border w-full ${containerClassName}`}
        isDisabled={isSubmitting}
        isPressable={!hasSubmitted}
        onPress={onSelect}
      >
        <CardBody className="px-4 py-2">
          <div>
            <span className="font-mono">{option.id}. </span>
            <span>{renderInlineMarkdown(option.text)}</span>
          </div>
        </CardBody>
      </Card>

      {hasSubmitted ? (
        <Card shadow="none">
          <CardBody className="px-4 py-2">
            <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
              {option.explanation}
            </ReactMarkdown>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
