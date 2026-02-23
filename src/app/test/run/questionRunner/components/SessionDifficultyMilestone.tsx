"use client";

import confetti from "canvas-confetti";
import {
  DIFFICULTY_LADDER_BY_SUBCATEGORY,
  isDifficultyDowngrade,
  isDifficultyUpgrade,
} from "@/lib/difficulty";
import type { SubcategoryEnum } from "@/lib/meta";
import { Card, CardBody, Chip } from "@heroui/react";
import { Fragment, useEffect, useRef } from "react";

type SessionDifficultyMilestoneProps = {
  subcategoryId: SubcategoryEnum;
  difficulty: string;
};

const DIFFICULTY_DOWNGRADE_EFFECT_DURATION_MS = 750;

function fireDifficultyUpgradeConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    startVelocity: 50,
    origin: { y: 0.7 },
  });
}

export default function SessionDifficultyMilestone({
  subcategoryId,
  difficulty,
}: SessionDifficultyMilestoneProps) {
  const previousDifficultyRef = useRef<string>(difficulty);
  const previousSubcategoryRef = useRef(subcategoryId);
  const downgradeEffectTimeoutRef = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const ladder = DIFFICULTY_LADDER_BY_SUBCATEGORY[subcategoryId] as readonly string[];
  const currentIndex = ladder.indexOf(difficulty);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  useEffect(() => {
    return () => {
      if (downgradeEffectTimeoutRef.current !== null) {
        window.clearTimeout(downgradeEffectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (previousSubcategoryRef.current !== subcategoryId) {
      previousSubcategoryRef.current = subcategoryId;
      previousDifficultyRef.current = difficulty;
      return;
    }

    const previousDifficulty = previousDifficultyRef.current;
    if (
      isDifficultyUpgrade(
        subcategoryId,
        previousDifficulty,
        difficulty,
      )
    ) {
      fireDifficultyUpgradeConfetti();
    } else if (
      isDifficultyDowngrade(
        subcategoryId,
        previousDifficulty,
        difficulty,
      )
    ) {
      const element = wrapperRef.current;
      if (element) {
        if (downgradeEffectTimeoutRef.current !== null) {
          window.clearTimeout(downgradeEffectTimeoutRef.current);
        }
        element.classList.remove("difficulty-downgrade-active");
        void element.offsetWidth;
        element.classList.add("difficulty-downgrade-active");
        downgradeEffectTimeoutRef.current = window.setTimeout(() => {
          element.classList.remove("difficulty-downgrade-active");
          downgradeEffectTimeoutRef.current = null;
        }, DIFFICULTY_DOWNGRADE_EFFECT_DURATION_MS);
      }
    }

    previousDifficultyRef.current = difficulty;
  }, [difficulty, subcategoryId]);

  return (
    <div className="rounded-2xl transition-colors" ref={wrapperRef}>
      <Card shadow="sm">
        <CardBody className="space-y-3 px-4 py-3">
          <div className="flex items-center gap-1.5">
            {ladder.map((level, index) => {
              const isReached = index <= activeIndex;
              const isCurrent = index === activeIndex;

              return (
                <Fragment key={level}>
                  <Chip
                    aria-current={isCurrent ? "step" : undefined}
                    color={isReached ? "primary" : "default"}
                    className={[
                      "min-w-10 text-center text-sm font-semibold tabular-nums",
                    ].join(" ")}
                    size="sm"
                    variant={isReached ? "solid" : "bordered"}
                  >
                    {level}
                  </Chip>
                  {index < ladder.length - 1 ? (
                    <div
                      className={[
                        "h-1 flex-1 rounded transition-colors",
                        index < activeIndex ? "bg-primary" : "bg-default-200",
                      ].join(" ")}
                    />
                  ) : null}
                </Fragment>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
