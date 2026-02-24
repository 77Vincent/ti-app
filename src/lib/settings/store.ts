import { create } from "zustand";
import type { UserSettings } from "./api";

type SettingsState = UserSettings & {
  applyUserSettings: (settings: UserSettings) => void;
  setIsSoundEnabled: (nextValue: boolean) => void;
  setIsLargeQuestionTextEnabled: (nextValue: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()((set) => ({
  isSoundEnabled: true,
  isLargeQuestionTextEnabled: false,
  applyUserSettings: (settings) =>
    set({
      isSoundEnabled: settings.isSoundEnabled,
      isLargeQuestionTextEnabled: settings.isLargeQuestionTextEnabled,
    }),
  setIsSoundEnabled: (nextValue) => set({ isSoundEnabled: nextValue }),
  setIsLargeQuestionTextEnabled: (nextValue) =>
    set({ isLargeQuestionTextEnabled: nextValue }),
}));
