"use client";

import { Card, CardBody } from "@heroui/react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { normalizeMathMarkdown } from "@/lib/question/markdown";
import type { QuestionOption } from "../types";

type QuestionChoiceProps = {
  option: QuestionOption;
  hasSubmitted: boolean;
  isSelected: boolean;
  isCorrect: boolean;
  isWrongSelection: boolean;
  onSelect: () => void;
};

function renderInlineMarkdown(markdown: string) {
  const normalizedMarkdown = normalizeMathMarkdown(markdown);

  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <span>{children}</span>,
      }}
      rehypePlugins={[rehypeKatex]}
      remarkPlugins={[remarkMath]}
    >
      {normalizedMarkdown}
    </ReactMarkdown>
  );
}

export default function QuestionChoice({
  option,
  hasSubmitted,
  isSelected,
  isCorrect,
  isWrongSelection,
  onSelect,
}: QuestionChoiceProps) {
  const containerClassName = hasSubmitted
    ? isCorrect
      ? "border-success-500 bg-success-50 dark:border-success-400 dark:bg-success-500/20"
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
        isPressable={!hasSubmitted}
        onPress={onSelect}
      >
        <CardBody className="px-4 py-2">
          <div>{renderInlineMarkdown(option.text)}</div>
        </CardBody>
      </Card>

      {hasSubmitted ? (
        <Card shadow="none">
          <CardBody className="px-4 py-1">
            <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
              {normalizeMathMarkdown(option.explanation)}
            </ReactMarkdown>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
