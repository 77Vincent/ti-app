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

  return `${correctCount}/${submittedCount} (${Math.round(accuracyRate * 100)}%)`;
}

export default function SessionAccuracy({
  correctCount,
  submittedCount,
}: SessionAccuracyProps) {

  return (
    <p className="font-bold text-lg tabular-nums">
      {formatSessionAccuracyLabel({
        correctCount,
        submittedCount,
      })}
    </p>
  );
}
