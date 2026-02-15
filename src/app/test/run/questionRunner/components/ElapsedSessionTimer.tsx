"use client";

import { Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { formatElapsedTime } from "../utils/timer";

export function computeElapsedSessionSeconds(
  startedAtMs: number,
  nowMs: number = Date.now(),
): number {
  return Math.max(0, Math.floor((nowMs - startedAtMs) / 1000));
}

type ElapsedSessionTimerProps = {
  startedAtMs: number;
};

export default function ElapsedSessionTimer({
  startedAtMs,
}: ElapsedSessionTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    computeElapsedSessionSeconds(startedAtMs),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(computeElapsedSessionSeconds(startedAtMs));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [startedAtMs]);

  return (
    <p className="inline-flex items-center gap-1.5 tabular-nums">
      <Timer aria-hidden size={20} />
      {formatElapsedTime(elapsedSeconds)}
    </p>
  );
}
