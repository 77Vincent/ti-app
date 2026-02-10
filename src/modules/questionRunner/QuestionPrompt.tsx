"use client";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

type QuestionPromptProps = {
  markdown: string;
};

export default function QuestionPrompt({ markdown }: QuestionPromptProps) {
  return (
    <div className="text-base leading-relaxed">
      <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
