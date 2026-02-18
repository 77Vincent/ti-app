"use client";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { normalizeMathMarkdown } from "@/lib/question/markdown";

type QuestionPromptProps = {
  markdown: string;
};

export default function QuestionPrompt({ markdown }: QuestionPromptProps) {
  const normalizedMarkdown = normalizeMathMarkdown(markdown);

  return (
    <div className="text-base leading-relaxed">
      <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
        {normalizedMarkdown}
      </ReactMarkdown>
    </div>
  );
}
