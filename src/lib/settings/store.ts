import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SettingsState = {
  isSoundEnabled: boolean;
  isLargeQuestionTextEnabled: boolean;
  setIsSoundEnabled: (nextValue: boolean) => void;
  setIsLargeQuestionTextEnabled: (nextValue: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isSoundEnabled: true,
      isLargeQuestionTextEnabled: false,
      setIsSoundEnabled: (nextValue) => set({ isSoundEnabled: nextValue }),
      setIsLargeQuestionTextEnabled: (nextValue) =>
        set({ isLargeQuestionTextEnabled: nextValue }),
    }),
    {
      name: "ti:settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isSoundEnabled: state.isSoundEnabled,
        isLargeQuestionTextEnabled: state.isLargeQuestionTextEnabled,
      }),
    },
  ),
);
