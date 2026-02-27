"use client";

import {
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  type LucideIcon,
} from "lucide-react";

type QuotaBatteryProps = {
  used: number;
  quota: number;
};

export default function QuotaBattery({ used, quota }: QuotaBatteryProps) {
  const remaining = Math.max(quota - used, 0);
  const remainingRatio = quota > 0
    ? Math.max(0, Math.min(remaining / quota, 1))
    : 0;

  let Icon: LucideIcon = BatteryWarning;
  let iconClassName = "text-danger";
  if (remainingRatio > 0.66) {
    Icon = BatteryFull;
    iconClassName = "text-success";
  } else if (remainingRatio > 0.33) {
    Icon = BatteryMedium;
    iconClassName = "text-warning";
  } else if (remainingRatio > 0) {
    Icon = BatteryLow;
    iconClassName = "text-danger";
  }

  return (
    <div
      aria-label={`Daily quota ${remaining} left out of ${quota}`}
      className="text-foreground-700 inline-flex flex-col items-center leading-none"
      title={`daily quota left: ${remaining}/${quota}`}
    >
      <Icon className={iconClassName} size={20} strokeWidth={2.5} />
      <span className="tabular-nums text-[10px]">
        {remaining}/{quota}
      </span>
    </div>
  );
}
