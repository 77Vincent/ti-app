"use client";

import { Target } from "lucide-react";

type SessionAccuracyProps = {
  correctCount: number;
  submittedCount: number;
};

export function getSessionAccuracyTextClass(accuracyRate: number): string {
  const accuracyPercent = accuracyRate * 100;

  if (accuracyPercent < 25) {
    return "text-red-500";
  }

  if (accuracyPercent <= 50) {
    return "text-amber-500";
  }

  if (accuracyPercent <= 75) {
    return "text-primary";
  }

  return "text-green-500";
}

export function formatSessionAccuracyLabel({
  correctCount,
  submittedCount,
}: SessionAccuracyProps): string {
  const accuracyRate =
    submittedCount === 0 ? 0 : correctCount / submittedCount;

  return `${Math.round(accuracyRate * 100)}% (${correctCount}/${submittedCount})`;
}

export default function SessionAccuracy({
  correctCount,
  submittedCount,
}: SessionAccuracyProps) {
  const accuracyRate =
    submittedCount === 0 ? 0 : correctCount / submittedCount;
  const accuracyTextClass = getSessionAccuracyTextClass(accuracyRate);

  return (
    <p className="inline-flex items-center gap-1.5 tabular-nums">
      <Target aria-hidden size={18} />
      <span className={`${accuracyTextClass} font-medium`}>
        {formatSessionAccuracyLabel({
          correctCount,
          submittedCount,
        })}
      </span>
    </p>
  );
}
