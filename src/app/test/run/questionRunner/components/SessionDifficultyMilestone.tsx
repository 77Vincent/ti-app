"use client";

import { DIFFICULTY_LADDER_BY_SUBCATEGORY } from "@/lib/difficulty";
import type { SubcategoryEnum } from "@/lib/meta";
import { Card, CardBody, Chip } from "@heroui/react";
import { Fragment } from "react";

type SessionDifficultyMilestoneProps = {
  subcategoryId: SubcategoryEnum;
  difficulty: string;
};

export default function SessionDifficultyMilestone({
  subcategoryId,
  difficulty,
}: SessionDifficultyMilestoneProps) {
  const ladder = DIFFICULTY_LADDER_BY_SUBCATEGORY[subcategoryId] as readonly string[];
  const currentIndex = ladder.indexOf(difficulty);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
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
  );
}
