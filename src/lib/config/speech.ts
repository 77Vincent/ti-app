import type { SubcategoryEnum } from "@/lib/meta";

export const QUESTION_PROMPT_SPEECH_RATE_DEFAULT = 1;
export const QUESTION_PROMPT_SPEECH_RATE_SLOW = 0.5;

const PROMPT_SPEECH_LANGUAGE_BY_SUBCATEGORY: Partial<Record<SubcategoryEnum, string>> = {
  english: "en-US",
  chinese: "zh-CN",
  japanese: "ja-JP",
};

export function resolvePromptSpeechLanguage(
  subcategoryId: SubcategoryEnum,
): string | undefined {
  return PROMPT_SPEECH_LANGUAGE_BY_SUBCATEGORY[subcategoryId];
}
