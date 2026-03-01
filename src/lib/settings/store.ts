import { create } from "zustand";
import type { UserSettings } from "./api";

type SettingsState = UserSettings & {
  applyUserSettings: (settings: UserSettings) => void;
  setIsSoundEnabled: (nextValue: boolean) => void;
  setIsLargeQuestionTextEnabled: (nextValue: boolean) => void;
  setIsSlowSpeechEnabled: (nextValue: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()((set) => ({
  isSoundEnabled: true,
  isLargeQuestionTextEnabled: false,
  isSlowSpeechEnabled: false,
  applyUserSettings: (settings) =>
    set({
      isSoundEnabled: settings.isSoundEnabled,
      isLargeQuestionTextEnabled: settings.isLargeQuestionTextEnabled,
      isSlowSpeechEnabled: settings.isSlowSpeechEnabled,
    }),
  setIsSoundEnabled: (nextValue) => set({ isSoundEnabled: nextValue }),
  setIsLargeQuestionTextEnabled: (nextValue) =>
    set({ isLargeQuestionTextEnabled: nextValue }),
  setIsSlowSpeechEnabled: (nextValue) => set({ isSlowSpeechEnabled: nextValue }),
}));
