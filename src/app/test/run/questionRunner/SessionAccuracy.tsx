"use client";

import { Target } from "lucide-react";

type SessionAccuracyProps = {
  accuracyRate: number;
  correctCount: number;
  submittedCount: number;
};

export function formatSessionAccuracyLabel({
  accuracyRate,
  correctCount,
  submittedCount,
}: SessionAccuracyProps): string {
  return `${Math.round(accuracyRate * 100)}% (${correctCount}/${submittedCount})`;
}

export default function SessionAccuracy({
  accuracyRate,
  correctCount,
  submittedCount,
}: SessionAccuracyProps) {
  return (
    <p className="inline-flex items-center gap-1.5 tabular-nums">
      <Target aria-hidden size={18} />
      {formatSessionAccuracyLabel({
        accuracyRate,
        correctCount,
        submittedCount,
      })}
    </p>
  );
}
