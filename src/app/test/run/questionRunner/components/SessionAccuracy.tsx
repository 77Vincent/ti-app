"use client";

type SessionAccuracyProps = {
  correctCount: number;
  submittedCount: number;
};

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

  return (
    <p className="font-bold tabular-nums">
      {formatSessionAccuracyLabel({
        correctCount,
        submittedCount,
      })}
    </p>
  );
}
