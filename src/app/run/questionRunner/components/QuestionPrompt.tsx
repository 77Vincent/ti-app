"use client";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { normalizeMathMarkdown } from "@/lib/question/markdown";
import {
  QUESTION_RUNNER_TEXT_SIZE_LARGE,
  QUESTION_RUNNER_TEXT_SIZE_NORMAL,
} from "@/lib/config/typography";
import { useSettingsStore } from "@/lib/settings/store";

type QuestionPromptProps = {
  markdown: string;
};

export default function QuestionPrompt({ markdown }: QuestionPromptProps) {
  const normalizedMarkdown = normalizeMathMarkdown(markdown);
  const isLargeQuestionTextEnabled = useSettingsStore(
    (state) => state.isLargeQuestionTextEnabled,
  );
  const textSizeClassName = isLargeQuestionTextEnabled
    ? QUESTION_RUNNER_TEXT_SIZE_LARGE
    : QUESTION_RUNNER_TEXT_SIZE_NORMAL;

  return (
    <div className={`${textSizeClassName} leading-relaxed`}>
      <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
        {normalizedMarkdown}
      </ReactMarkdown>
    </div>
  );
}
