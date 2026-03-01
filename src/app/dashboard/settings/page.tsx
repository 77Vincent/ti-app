"use client";

import dynamic from "next/dynamic";
import { Moon, Music, Type, Volume2 } from "lucide-react";
import { useTheme } from "next-themes";
import { type ReactNode } from "react";
import { updateUserSettings } from "@/lib/settings/api";
import { useSettingsStore } from "@/lib/settings/store";
import DifficultyAdjustSection from "./DifficultyAdjustSection";

type SettingItemProps = {
  icon: ReactNode;
  label: string;
  isSelected: boolean;
  onValueChange: (nextValue: boolean) => void;
};

function SettingItem({
  icon,
  label,
  isSelected,
  onValueChange,
}: SettingItemProps) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </span>
      <ClientSwitch
        aria-label={label}
        isSelected={isSelected}
        onValueChange={onValueChange}
        size="sm"
      />
    </div>
  );
}

const ClientSwitch = dynamic(
  () => import("@/app/components/ClientSwitch").then((module) => module.ClientSwitch),
  { ssr: false },
);

export default function DashboardSettingsPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const isSoundEnabled = useSettingsStore((state) => state.isSoundEnabled);
  const setIsSoundEnabled = useSettingsStore(
    (state) => state.setIsSoundEnabled,
  );
  const isLargeQuestionTextEnabled = useSettingsStore(
    (state) => state.isLargeQuestionTextEnabled,
  );
  const setIsLargeQuestionTextEnabled = useSettingsStore(
    (state) => state.setIsLargeQuestionTextEnabled,
  );
  const isSlowSpeechEnabled = useSettingsStore(
    (state) => state.isSlowSpeechEnabled,
  );
  const setIsSlowSpeechEnabled = useSettingsStore(
    (state) => state.setIsSlowSpeechEnabled,
  );
  const applyUserSettings = useSettingsStore((state) => state.applyUserSettings);

  function handleSoundChange(nextValue: boolean) {
    setIsSoundEnabled(nextValue);

    void updateUserSettings({ isSoundEnabled: nextValue })
      .then((settings) => {
        applyUserSettings(settings);
      })
      .catch(() => undefined);
  }

  function handleLargeFontChange(nextValue: boolean) {
    setIsLargeQuestionTextEnabled(nextValue);

    void updateUserSettings({ isLargeQuestionTextEnabled: nextValue })
      .then((settings) => {
        applyUserSettings(settings);
      })
      .catch(() => undefined);
  }

  function handleThemeChange(nextValue: boolean) {
    setTheme(nextValue ? "dark" : "light");
  }

  function handleSlowSpeechChange(nextValue: boolean) {
    setIsSlowSpeechEnabled(nextValue);

    void updateUserSettings({ isSlowSpeechEnabled: nextValue })
      .then((settings) => {
        applyUserSettings(settings);
      })
      .catch(() => undefined);
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex w-full flex-col gap-4">
        <SettingItem
          icon={<Music aria-hidden size={18} />}
          isSelected={isSoundEnabled}
          label="Sound"
          onValueChange={handleSoundChange}
        />

        <SettingItem
          icon={<Type aria-hidden size={18} />}
          isSelected={isLargeQuestionTextEnabled}
          label="Large font"
          onValueChange={handleLargeFontChange}
        />

        <SettingItem
          icon={<Volume2 aria-hidden size={18} />}
          isSelected={isSlowSpeechEnabled}
          label="slow speech"
          onValueChange={handleSlowSpeechChange}
        />

        <SettingItem
          icon={<Moon aria-hidden size={18} />}
          isSelected={resolvedTheme === "dark"}
          label="Dark mode"
          onValueChange={handleThemeChange}
        />
      </div>
      <DifficultyAdjustSection />
    </div>
  );
}
