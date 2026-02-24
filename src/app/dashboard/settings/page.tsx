"use client";

import dynamic from "next/dynamic";
import { Music, Type } from "lucide-react";
import { type ReactNode } from "react";
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
  () => import("./ClientSwitch").then((module) => module.ClientSwitch),
  { ssr: false },
);

export default function DashboardSettingsPage() {
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

  return (
    <div className="flex w-full max-w-2xs flex-col gap-4">
      <SettingItem
        icon={<Music aria-hidden size={18} />}
        isSelected={isSoundEnabled}
        label="Sound"
        onValueChange={setIsSoundEnabled}
      />

      <SettingItem
        icon={<Type aria-hidden size={18} />}
        isSelected={isLargeQuestionTextEnabled}
        label="Large font"
        onValueChange={setIsLargeQuestionTextEnabled}
      />
    </div>
  );
}
