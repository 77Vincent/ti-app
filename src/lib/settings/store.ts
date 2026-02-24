import { create } from "zustand";

type SettingsState = {
  isSoundEnabled: boolean;
  isLargeQuestionTextEnabled: boolean;
  setIsSoundEnabled: (nextValue: boolean) => void;
  setIsLargeQuestionTextEnabled: (nextValue: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()((set) => ({
  isSoundEnabled: true,
  isLargeQuestionTextEnabled: false,
  setIsSoundEnabled: (nextValue) => set({ isSoundEnabled: nextValue }),
  setIsLargeQuestionTextEnabled: (nextValue) =>
    set({ isLargeQuestionTextEnabled: nextValue }),
}));
