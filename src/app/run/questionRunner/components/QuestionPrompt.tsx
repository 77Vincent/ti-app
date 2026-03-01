"use client";

import { useCallback, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { Button } from "@heroui/react";
import { Square, Volume2 } from "lucide-react";
import { normalizeMathMarkdown } from "@/lib/question/markdown";
import {
  QUESTION_RUNNER_TEXT_SIZE_LARGE,
  QUESTION_RUNNER_TEXT_SIZE_NORMAL,
} from "@/lib/config/typography";
import { useSettingsStore } from "@/lib/settings/store";
import { usePromptSpeech } from "../hooks/usePromptSpeech";

type QuestionPromptProps = {
  markdown: string;
  showReadButton?: boolean;
  readLanguage?: string;
};

export default function QuestionPrompt({
  markdown,
  showReadButton = false,
  readLanguage,
}: QuestionPromptProps) {
  const promptTextContainerRef = useRef<HTMLDivElement | null>(null);

  const normalizedMarkdown = normalizeMathMarkdown(markdown);
  const isLargeQuestionTextEnabled = useSettingsStore(
    (state) => state.isLargeQuestionTextEnabled,
  );
  const textSizeClassName = isLargeQuestionTextEnabled
    ? QUESTION_RUNNER_TEXT_SIZE_LARGE
    : QUESTION_RUNNER_TEXT_SIZE_NORMAL;
  const getPromptText = useCallback(() => {
    return promptTextContainerRef.current?.textContent ?? "";
  }, []);
  const {
    isSpeechSupported,
    isSpeaking,
    toggleSpeak: handleReadPress,
  } = usePromptSpeech({
    getTextToSpeak: getPromptText,
    language: readLanguage,
    cancelOnChangeKey: normalizedMarkdown,
  });

  return (
    <div className="space-y-1">
      <div ref={promptTextContainerRef} className={`${textSizeClassName} leading-relaxed`}>
        <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
          {normalizedMarkdown}
        </ReactMarkdown>
      </div>

      {showReadButton && isSpeechSupported ? (
        <div className="flex justify-start">
          <Button
            aria-label={isSpeaking ? "Stop reading question" : "Read question"}
            aria-pressed={isSpeaking}
            isIconOnly
            size="sm"
            variant="flat"
            onPress={handleReadPress}
          >
            {isSpeaking
              ? <Square aria-hidden size={14} strokeWidth={2.5} />
              : <Volume2 aria-hidden size={18} strokeWidth={2.5} />}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
