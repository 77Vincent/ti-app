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
import MidiSfx, { type MidiSfxHandle } from "./MidiSfx";

type SessionDifficultyMilestoneProps = {
  subcategoryId: SubcategoryEnum;
  difficulty: string;
};

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
  const difficultyUpgradeSfxRef = useRef<MidiSfxHandle | null>(null);
  const difficultyDowngradeSfxRef = useRef<MidiSfxHandle | null>(null);
  const previousDifficultyRef = useRef<string>(difficulty);
  const previousSubcategoryRef = useRef(subcategoryId);
  const ladder = DIFFICULTY_LADDER_BY_SUBCATEGORY[subcategoryId] as readonly string[];
  const currentIndex = ladder.indexOf(difficulty);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

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
      difficultyUpgradeSfxRef.current?.play();
      fireDifficultyUpgradeConfetti();
    } else if (
      isDifficultyDowngrade(
        subcategoryId,
        previousDifficulty,
        difficulty,
      )
    ) {
      difficultyDowngradeSfxRef.current?.play();
    }

    previousDifficultyRef.current = difficulty;
  }, [difficulty, subcategoryId]);

  return (
    <div className="rounded-2xl transition-colors">
      <MidiSfx
        presetId="difficultyUpgrade"
        ref={difficultyUpgradeSfxRef}
      />
      <MidiSfx
        presetId="difficultyDowngrade"
        ref={difficultyDowngradeSfxRef}
      />

      <Card shadow="sm">
        <CardBody className="space-y-3">
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
