"use client";

import { Capacitor } from "@capacitor/core";
import {
  Haptics,
  ImpactStyle,
  NotificationType,
} from "@capacitor/haptics";

function canUseNativeHaptics(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

async function runHaptic(task: () => Promise<void>): Promise<void> {
  if (!canUseNativeHaptics()) {
    return;
  }

  try {
    await task();
  } catch {
    // Ignore haptics failures; they should never block user flow.
  }
}

export function triggerSelectionHaptic(): void {
  void runHaptic(() => Haptics.selectionChanged());
}

export function triggerLightImpactHaptic(): void {
  void runHaptic(() => Haptics.impact({ style: ImpactStyle.Light }));
}

export function triggerSuccessHaptic(): void {
  void runHaptic(() =>
    Haptics.notification({ type: NotificationType.Success }),
  );
}

export function triggerWrongAnswerHaptic(): void {
  void runHaptic(() =>
    Haptics.notification({ type: NotificationType.Warning }),
  );
}
