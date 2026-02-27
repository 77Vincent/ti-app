"use client";

import { useEffect, useState } from "react";
import { readTestSession } from "@/app/run/questionRunner/session/storage";
import { getInitialDifficultyForSubcategory } from "@/lib/difficulty";
import { SUBCATEGORIES, type SubcategoryEnum } from "@/lib/meta";
import { toast } from "@/lib/toast";
import { updateTestSessionDifficulty } from "./api";

type DifficultyBySubcategory = Record<SubcategoryEnum, string>;
type SessionAvailabilityBySubcategory = Record<SubcategoryEnum, boolean>;

function buildInitialState(): {
  difficultyBySubcategory: DifficultyBySubcategory;
  hasSessionBySubcategory: SessionAvailabilityBySubcategory;
} {
  return {
    difficultyBySubcategory: Object.fromEntries(
      SUBCATEGORIES.map((subcategory) => [
        subcategory.id,
        getInitialDifficultyForSubcategory(subcategory.id),
      ]),
    ) as DifficultyBySubcategory,
    hasSessionBySubcategory: Object.fromEntries(
      SUBCATEGORIES.map((subcategory) => [subcategory.id, false]),
    ) as SessionAvailabilityBySubcategory,
  };
}

const INITIAL_STATE = buildInitialState();

const SUBCATEGORY_BY_ID = Object.fromEntries(
  SUBCATEGORIES.map((subcategory) => [subcategory.id, subcategory]),
) as Record<SubcategoryEnum, (typeof SUBCATEGORIES)[number]>;

export function useDifficultyAdjustments() {
  const [difficultyBySubcategory, setDifficultyBySubcategory] =
    useState<DifficultyBySubcategory>(INITIAL_STATE.difficultyBySubcategory);
  const [hasSessionBySubcategory, setHasSessionBySubcategory] =
    useState<SessionAvailabilityBySubcategory>(
      INITIAL_STATE.hasSessionBySubcategory,
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

        const {
          difficultyBySubcategory: nextDifficulty,
          hasSessionBySubcategory: nextAvailability,
        } = buildInitialState();

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
          const { hasSessionBySubcategory: nextAvailability } = buildInitialState();
          setHasSessionBySubcategory(nextAvailability);
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

  const hasAnyAdjustableSession = Object.values(hasSessionBySubcategory).some(
    Boolean,
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
