"use client";

import { Switch } from "@heroui/react";
import { Moon, Music, Type } from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { useSettingsStore } from "@/lib/settings/store";

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
      <Switch
        aria-label={label}
        isSelected={isSelected}
        onValueChange={onValueChange}
        size="sm"
      />
    </div>
  );
}

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
  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex w-full flex-col gap-4">
      <SettingItem
        icon={<Music aria-hidden size={16} />}
        isSelected={isSoundEnabled}
        label="Sound"
        onValueChange={setIsSoundEnabled}
      />

      <SettingItem
        icon={<Moon aria-hidden size={16} />}
        isSelected={isDark}
        label="Dark mode"
        onValueChange={(nextIsDark) => setTheme(nextIsDark ? "dark" : "light")}
      />

      <SettingItem
        icon={<Type aria-hidden size={16} />}
        isSelected={isLargeQuestionTextEnabled}
        label="Large font"
        onValueChange={setIsLargeQuestionTextEnabled}
      />
    </div>
  );
}
