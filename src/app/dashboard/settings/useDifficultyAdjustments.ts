"use client";

import { useEffect, useMemo, useState } from "react";
import { readTestSession } from "@/app/run/questionRunner/session/storage";
import { getInitialDifficultyForSubcategory } from "@/lib/difficulty";
import { SUBCATEGORIES, type SubcategoryEnum } from "@/lib/meta";
import { toast } from "@/lib/toast";
import { updateTestSessionDifficulty } from "./api";

type DifficultyBySubcategory = Record<SubcategoryEnum, string>;
type SessionAvailabilityBySubcategory = Record<SubcategoryEnum, boolean>;

function buildInitialDifficultyBySubcategory(): DifficultyBySubcategory {
  return Object.fromEntries(
    SUBCATEGORIES.map((subcategory) => [
      subcategory.id,
      getInitialDifficultyForSubcategory(subcategory.id),
    ]),
  ) as DifficultyBySubcategory;
}

function buildInitialSessionAvailabilityBySubcategory(): SessionAvailabilityBySubcategory {
  return Object.fromEntries(
    SUBCATEGORIES.map((subcategory) => [subcategory.id, false]),
  ) as SessionAvailabilityBySubcategory;
}

const SUBCATEGORY_BY_ID = Object.fromEntries(
  SUBCATEGORIES.map((subcategory) => [subcategory.id, subcategory]),
) as Record<SubcategoryEnum, (typeof SUBCATEGORIES)[number]>;

export function useDifficultyAdjustments() {
  const [difficultyBySubcategory, setDifficultyBySubcategory] =
    useState<DifficultyBySubcategory>(buildInitialDifficultyBySubcategory);
  const [hasSessionBySubcategory, setHasSessionBySubcategory] =
    useState<SessionAvailabilityBySubcategory>(
      buildInitialSessionAvailabilityBySubcategory,
    );
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [updatingSubcategoryId, setUpdatingSubcategoryId] =
    useState<SubcategoryEnum | null>(null);

  useEffect(() => {
    let active = true;

    void Promise.all(
      SUBCATEGORIES.map((subcategory) =>
        readTestSession({
          subjectId: subcategory.subjectId,
          subcategoryId: subcategory.id,
        }),
      ),
    )
      .then((sessions) => {
        if (!active) {
          return;
        }

        const nextDifficulty = buildInitialDifficultyBySubcategory();
        const nextAvailability = buildInitialSessionAvailabilityBySubcategory();

        sessions.forEach((session, index) => {
          if (!session) {
            return;
          }

          const subcategory = SUBCATEGORIES[index];
          nextDifficulty[subcategory.id] = session.difficulty;
          nextAvailability[subcategory.id] = true;
        });

        setDifficultyBySubcategory(nextDifficulty);
        setHasSessionBySubcategory(nextAvailability);
      })
      .catch(() => {
        if (active) {
          setHasSessionBySubcategory(buildInitialSessionAvailabilityBySubcategory());
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingSessions(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const hasAnyAdjustableSession = useMemo(
    () => Object.values(hasSessionBySubcategory).some(Boolean),
    [hasSessionBySubcategory],
  );

  function handleDifficultyChange(
    subcategoryId: SubcategoryEnum,
    nextDifficulty: string,
  ) {
    const hasSession = hasSessionBySubcategory[subcategoryId];
    const currentDifficulty = difficultyBySubcategory[subcategoryId];

    if (
      !hasSession ||
      updatingSubcategoryId === subcategoryId ||
      nextDifficulty === currentDifficulty
    ) {
      return;
    }

    const subcategory = SUBCATEGORY_BY_ID[subcategoryId];
    if (!subcategory) {
      return;
    }

    setDifficultyBySubcategory((previous) => ({
      ...previous,
      [subcategoryId]: nextDifficulty,
    }));
    setUpdatingSubcategoryId(subcategoryId);

    void updateTestSessionDifficulty({
      subjectId: subcategory.subjectId,
      subcategoryId,
      difficulty: nextDifficulty,
    })
      .then((session) => {
        setDifficultyBySubcategory((previous) => ({
          ...previous,
          [subcategoryId]: session.difficulty,
        }));
      })
      .catch((error) => {
        setDifficultyBySubcategory((previous) => ({
          ...previous,
          [subcategoryId]: currentDifficulty,
        }));
        toast.error(error, {
          fallbackDescription: `Failed to update ${subcategory.label} difficulty.`,
        });
      })
      .finally(() => {
        setUpdatingSubcategoryId(null);
      });
  }

  return {
    difficultyBySubcategory,
    hasSessionBySubcategory,
    isLoadingSessions,
    updatingSubcategoryId,
    hasAnyAdjustableSession,
    handleDifficultyChange,
  };
}
