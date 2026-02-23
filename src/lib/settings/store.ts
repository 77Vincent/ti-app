import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SettingsState = {
  isSoundEnabled: boolean;
  setIsSoundEnabled: (nextValue: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isSoundEnabled: true,
      setIsSoundEnabled: (nextValue) => set({ isSoundEnabled: nextValue }),
    }),
    {
      name: "ti:settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isSoundEnabled: state.isSoundEnabled,
      }),
    },
  ),
);
