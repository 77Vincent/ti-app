"use client";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { normalizeMathMarkdown } from "@/lib/question/markdown";
import { QUESTION_RUNNER_TEXT_SIZE_NORMAL } from "@/lib/config/typography";

type QuestionPromptProps = {
  markdown: string;
};

export default function QuestionPrompt({ markdown }: QuestionPromptProps) {
  const normalizedMarkdown = normalizeMathMarkdown(markdown);

  return (
    <div className={`${QUESTION_RUNNER_TEXT_SIZE_NORMAL} leading-relaxed`}>
      <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
        {normalizedMarkdown}
      </ReactMarkdown>
    </div>
  );
}
