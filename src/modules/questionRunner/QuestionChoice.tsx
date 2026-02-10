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
        ? "border-warning-500 bg-warning-50 dark:border-warning-400 dark:bg-warning-500/20"
        : "border-success-500 bg-success-50 dark:border-success-400 dark:bg-success-500/20"
      : isWrongSelection
        ? "border-danger-500 bg-danger-50 dark:border-danger-400 dark:bg-danger-500/20"
        : "border-default-300 bg-default-50 dark:border-default-400 dark:bg-default-100/10"
    : isSelected
      ? "border-primary bg-primary-50 dark:bg-primary-500/20"
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
