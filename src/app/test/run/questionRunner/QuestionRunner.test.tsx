import { QUESTION_TYPES } from "@/lib/meta";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import React from "react";
import QuestionRunner from "./QuestionRunner";
import type { Question } from "./types";

const MOCK_QUESTION: Question = {
  id: "question-1",
  questionType: QUESTION_TYPES.MULTIPLE_CHOICE,
  prompt: "Mock prompt",
  options: [
    { id: "A", text: "A", explanation: "A" },
    { id: "B", text: "B", explanation: "B" },
    { id: "C", text: "C", explanation: "C" },
    { id: "D", text: "D", explanation: "D" },
  ],
  correctOptionIds: ["A"],
};

function hasTooltipContent(node: ReactNode, content: string): boolean {
  if (node === null || node === undefined || typeof node === "boolean") {
    return false;
  }

  if (Array.isArray(node)) {
    return node.some((child) => hasTooltipContent(child, content));
  }

  if (!React.isValidElement(node)) {
    return false;
  }

  const props = node.props as {
    content?: unknown;
    children?: ReactNode;
  };

  if (props.content === content) {
    return true;
  }

  return hasTooltipContent(props.children, content);
}

describe("QuestionRunner", () => {
  it("shows tooltip for previous button when previous question is available", () => {
    const tree = QuestionRunner({
      question: MOCK_QUESTION,
      isLoadingQuestion: false,
      isSubmitting: false,
      hasSubmitted: false,
      selectedOptionIds: [],
      canGoToPreviousQuestion: true,
      isFavoriteSubmitting: false,
      isSignInRequired: false,
      signInDemand: null,
      goToPreviousQuestion: () => {},
      selectOption: () => {},
      submit: async () => {},
    });

    expect(hasTooltipContent(tree, "Previous question")).toBe(true);
  });
});
