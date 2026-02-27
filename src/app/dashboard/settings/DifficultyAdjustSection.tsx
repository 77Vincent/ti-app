"use client";

import { Chip, Select, SelectItem } from "@heroui/react";
import { DIFFICULTY_LADDER_BY_SUBCATEGORY } from "@/lib/difficulty";
import { getSubjectIcon, SUBCATEGORIES } from "@/lib/meta";
import { useDifficultyAdjustments } from "./useDifficultyAdjustments";

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
        <Chip color="warning" size="sm" variant="flat">
          <span className="font-semibold"> Pro </span>
        </Chip>
      </div>

      {isLoadingSessions ? (
        <p className="text-default-500 text-sm">Loading...</p>
      ) : null}

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
