import { describe, expect, it } from "vitest";
import QuestionRunner from "./QuestionRunner";
import type { Question } from "../types";
import { renderToStaticMarkup } from "react-dom/server";

const MOCK_QUESTION: Question = {
  id: "question-1",
  prompt: "Mock prompt",
  difficulty: "A1",
  options: [
    { text: "A", explanation: "A" },
    { text: "B", explanation: "B" },
    { text: "C", explanation: "C" },
    { text: "D", explanation: "D" },
  ],
  correctOptionIndexes: [0],
};

describe("QuestionRunner", () => {
  it("does not render navigation controls", () => {
    const markup = renderToStaticMarkup(
      <QuestionRunner
        hasSubmitted={false}
        isLoadingQuestion={false}
        isSignInRequired={false}
        question={MOCK_QUESTION}
        selectOption={() => {}}
        selectedOptionIndexes={[]}
        signInDemand={null}
      />,
    );

    expect(markup).not.toContain("Previous question");
  });
});
