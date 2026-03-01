"use client";

import { useCallback, useEffect, useState } from "react";

type UseSpeechSynthesisEngineResult = {
  synthesis: SpeechSynthesis | null;
  isSpeechSupported: boolean;
  voices: SpeechSynthesisVoice[];
  cancel: () => void;
};

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === "undefined") {
    return null;
  }

  const isSupported =
    typeof window.speechSynthesis !== "undefined" &&
    typeof window.SpeechSynthesisUtterance !== "undefined";
  if (!isSupported) {
    return null;
  }

  return window.speechSynthesis;
}

export function useSpeechSynthesisEngine(): UseSpeechSynthesisEngineResult {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => {
    const synthesis = getSpeechSynthesis();
    if (!synthesis) {
      return [];
    }

    return synthesis.getVoices();
  });
  const synthesis = getSpeechSynthesis();
  const isSpeechSupported = synthesis !== null;

  const cancel = useCallback(() => {
    synthesis?.cancel();
  }, [synthesis]);

  useEffect(() => {
    const currentSynthesis = getSpeechSynthesis();
    if (!currentSynthesis) {
      return;
    }

    const syncVoices = () => {
      setVoices(currentSynthesis.getVoices());
    };
    currentSynthesis.addEventListener("voiceschanged", syncVoices);

    return () => {
      currentSynthesis.removeEventListener("voiceschanged", syncVoices);
    };
  }, []);

  return {
    synthesis,
    isSpeechSupported,
    voices,
    cancel,
  };
}
