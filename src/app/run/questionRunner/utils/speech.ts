export function selectSpeechVoiceByLanguage(
  voices: SpeechSynthesisVoice[],
  language: string,
): SpeechSynthesisVoice | undefined {
  const normalizedLanguage = language.trim().toLowerCase();
  if (!normalizedLanguage) {
    return undefined;
  }

  return voices.find((voice) => {
    return voice.lang.toLowerCase().startsWith(normalizedLanguage);
  });
}
