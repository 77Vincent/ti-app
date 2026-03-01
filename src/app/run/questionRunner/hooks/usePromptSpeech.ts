"use client";

import { useCallback, useEffect, useState } from "react";
import { selectSpeechVoiceByLanguage } from "../utils/speech";
import { useSpeechSynthesisEngine } from "./useSpeechSynthesisEngine";

type UsePromptSpeechInput = {
  getTextToSpeak: () => string;
  language?: string;
  cancelOnChangeKey: string;
};

type UsePromptSpeechResult = {
  isSpeechSupported: boolean;
  isSpeaking: boolean;
  toggleSpeak: () => void;
};

export function usePromptSpeech({
  getTextToSpeak,
  language,
  cancelOnChangeKey,
}: UsePromptSpeechInput): UsePromptSpeechResult {
  const [isSpeakingUi, setIsSpeakingUi] = useState(false);
  const {
    synthesis,
    isSpeechSupported,
    voices,
    cancel,
  } = useSpeechSynthesisEngine();
  const isActuallySpeaking = isSpeechSupported &&
    (isSpeakingUi || synthesis?.speaking === true);

  const cancelSpeaking = useCallback((
    suppressStateReset = false,
  ) => {
    cancel();
    if (!suppressStateReset) {
      setIsSpeakingUi(false);
    }
  }, [cancel]);

  const toggleSpeak = useCallback(() => {
    if (!synthesis) {
      return;
    }

    if (isSpeakingUi || synthesis.speaking) {
      cancelSpeaking();
      return;
    }

    const textToSpeak = getTextToSpeak().trim();
    if (!textToSpeak) {
      return;
    }

    cancelSpeaking();

    const utterance = new window.SpeechSynthesisUtterance(textToSpeak);
    if (language) {
      utterance.lang = language;
      const preferredVoice = selectSpeechVoiceByLanguage(
        voices.length > 0 ? voices : synthesis.getVoices(),
        language,
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onstart = () => {
      setIsSpeakingUi(true);
    };
    utterance.onend = () => {
      setIsSpeakingUi(false);
    };
    utterance.onerror = () => {
      setIsSpeakingUi(false);
    };

    synthesis.speak(utterance);
  }, [cancelSpeaking, getTextToSpeak, isSpeakingUi, language, synthesis, voices]);

  useEffect(() => {
    if (!isSpeechSupported) {
      return;
    }

    return () => {
      cancelSpeaking(true);
    };
  }, [cancelSpeaking, isSpeechSupported]);

  useEffect(() => {
    if (!isSpeechSupported || !synthesis) {
      return;
    }

    synthesis.cancel();
  }, [cancelOnChangeKey, isSpeechSupported, synthesis]);

  return {
    isSpeechSupported,
    isSpeaking: isActuallySpeaking,
    toggleSpeak,
  };
}
