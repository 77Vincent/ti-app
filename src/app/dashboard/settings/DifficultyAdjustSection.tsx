"use client";

import { Select, SelectItem, Skeleton } from "@heroui/react";
import { DIFFICULTY_LADDER_BY_SUBCATEGORY } from "@/lib/difficulty";
import { getSubjectIcon, SUBCATEGORIES } from "@/lib/meta";
import { useDifficultyAdjustments } from "./useDifficultyAdjustments";
import { ProBadge } from "@/app/components";

const DIFFICULTY_ADJUST_SKELETON_COUNT = SUBCATEGORIES.length;

function DifficultyAdjustLoadingSkeleton({ rowCount }: { rowCount: number }) {
  return (
    <div className="flex w-full flex-col gap-2">
      {Array.from({ length: rowCount }).map((_, index) => (
        <div
          className="flex w-full items-center justify-between gap-3"
          key={`difficulty-adjust-skeleton-${index + 1}`}
        >
          <span className="inline-flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </span>
          <Skeleton className="h-7.5 w-28 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default function DifficultyAdjustSection() {
  const {
    difficultyBySubcategory,
    hasSessionBySubcategory,
    isLoadingSessions,
    isPro,
    updatingSubcategoryId,
    hasAnyAdjustableSession,
    handleDifficultyChange,
  } = useDifficultyAdjustments();

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="inline-flex items-center gap-2">
        <span className="font-semibold">Difficulty adjust</span>
        <ProBadge />
      </div>

      {isLoadingSessions
        ? <DifficultyAdjustLoadingSkeleton rowCount={DIFFICULTY_ADJUST_SKELETON_COUNT} />
        : null}

      {!isLoadingSessions ? (
        <div className="flex w-full flex-col gap-2">
          {SUBCATEGORIES.map((subcategory) => {
            const SubjectIcon = getSubjectIcon(subcategory.subjectId);
            const selectedDifficulty = difficultyBySubcategory[subcategory.id];
            const isAdjustable = hasSessionBySubcategory[subcategory.id];
            const isUpdating = updatingSubcategoryId === subcategory.id;
            const difficultyLadder =
              DIFFICULTY_LADDER_BY_SUBCATEGORY[subcategory.id].ladder;

            return (
              <div
                className="flex w-full items-center justify-between gap-3"
                key={subcategory.id}
              >
                <span className="inline-flex items-center gap-2">
                  <SubjectIcon aria-hidden size={16} />
                  <span>{subcategory.label}</span>
                </span>
                <Select
                  aria-label={`${subcategory.label} difficulty`}
                  className="w-28"
                  color="primary"
                  disallowEmptySelection
                  isDisabled={!isPro || !isAdjustable || isUpdating}
                  isLoading={isUpdating}
                  selectedKeys={new Set([selectedDifficulty])}
                  size="sm"
                  variant="bordered"
                  onSelectionChange={(selection) => {
                    const [nextDifficulty] = Array.from(selection as Set<string>);
                    handleDifficultyChange(subcategory.id, String(nextDifficulty));
                  }}
                >
                  {difficultyLadder.map((difficulty) => (
                    <SelectItem key={difficulty}>{difficulty}</SelectItem>
                  ))}
                </Select>
              </div>
            );
          })}
        </div>
      ) : null}

      {!isLoadingSessions && !hasAnyAdjustableSession ? (
        <p className="text-default-500 text-sm">
          Start a test first to enable difficulty adjustment.
        </p>
      ) : null}
    </div>
  );
}
