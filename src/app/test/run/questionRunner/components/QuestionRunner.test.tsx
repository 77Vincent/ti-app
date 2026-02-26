import { describe, expect, it } from "vitest";
import QuestionRunner from "./QuestionRunner";
import { PAGE_PATHS } from "@/lib/config/paths";
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

  it("renders sign-in CTA for more_questions demand", () => {
    const markup = renderToStaticMarkup(
      <QuestionRunner
        hasSubmitted={false}
        isLoadingQuestion={false}
        isSignInRequired
        question={MOCK_QUESTION}
        selectOption={() => {}}
        selectedOptionIndexes={[]}
        signInDemand="more_questions"
      />,
    );

    expect(markup).toContain("Sign in for more questions");
    expect(markup).toContain(`href="${PAGE_PATHS.SIGN_IN}"`);
  });

  it("renders upgrade CTA for upgrade_pro demand", () => {
    const markup = renderToStaticMarkup(
      <QuestionRunner
        hasSubmitted={false}
        isLoadingQuestion={false}
        isSignInRequired
        question={MOCK_QUESTION}
        selectOption={() => {}}
        selectedOptionIndexes={[]}
        signInDemand="upgrade_pro"
      />,
    );

    expect(markup).toContain("Upgrade to Pro for unlimited daily quota");
    expect(markup).toContain(`href="${PAGE_PATHS.DASHBOARD_ACCOUNT}"`);
  });
});
