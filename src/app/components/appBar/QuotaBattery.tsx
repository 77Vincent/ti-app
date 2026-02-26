"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@heroui/react";
import {
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

type QuotaBatteryProps = {
  used: number;
  quota: number;
};

export default function QuotaBattery({ used, quota }: QuotaBatteryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const remainingRatio = quota > 0
    ? Math.max(0, Math.min((quota - used) / quota, 1))
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
    <Popover
      isOpen={isOpen}
      placement="left"
      onOpenChange={setIsOpen}
    >
      <PopoverTrigger>
        <button
          aria-label={`Daily quota ${used} out of ${quota}`}
          className="block"
          onBlur={() => setIsOpen(false)}
          onFocus={() => setIsOpen(true)}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          type="button"
        >
          <Icon className={iconClassName} size={20} strokeWidth={2.5} />
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <span className="tabular-nums">
          daily quota: {used}/{quota}
        </span>
      </PopoverContent>
    </Popover>
  );
}
