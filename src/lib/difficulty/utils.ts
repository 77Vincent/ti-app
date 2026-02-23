import type { SubcategoryEnum } from "@/lib/meta";
import {
  DIFFICULTY_ADAPTIVE_WINDOW_SIZE,
  DIFFICULTY_DEMOTE_ACCURACY_THRESHOLD,
  DIFFICULTY_LADDER_BY_SUBCATEGORY,
  DIFFICULTY_LEVEL_CHANGE_COOLDOWN_SUBMISSIONS,
  DIFFICULTY_PROMOTE_ACCURACY_THRESHOLD,
} from "./config";

export function getInitialDifficultyForSubcategory(
  subcategoryId: SubcategoryEnum,
): string {
  return DIFFICULTY_LADDER_BY_SUBCATEGORY[subcategoryId][0];
}

export function isDifficultyAllowedForSubcategory(
  subcategoryId: SubcategoryEnum,
  difficulty: string,
): boolean {
  const ladder = DIFFICULTY_LADDER_BY_SUBCATEGORY[subcategoryId] as readonly string[];
  return ladder.includes(difficulty);
}

export function isDifficultyUpgrade(
  subcategoryId: SubcategoryEnum,
  currentDifficulty: string,
  nextDifficulty: string,
): boolean {
  const ladder = DIFFICULTY_LADDER_BY_SUBCATEGORY[subcategoryId] as readonly string[];
  const currentIndex = ladder.indexOf(currentDifficulty);
  const nextIndex = ladder.indexOf(nextDifficulty);
  return currentIndex >= 0 && nextIndex >= 0 && nextIndex > currentIndex;
}

type NextDifficultyInput = {
  subcategoryId: SubcategoryEnum;
  currentDifficulty: string;
  recentOutcomes: number[];
  difficultyCooldownRemaining: number;
  isCorrect: boolean;
};

export type AdaptiveDifficultyResult = {
  difficulty: string;
  recentOutcomes: number[];
  difficultyCooldownRemaining: number;
};

function appendOutcomeToWindow(
  currentWindow: number[],
  isCorrect: boolean,
): number[] {
  const window = [...currentWindow, isCorrect ? 1 : 0];
  if (window.length <= DIFFICULTY_ADAPTIVE_WINDOW_SIZE) {
    return window;
  }

  return window.slice(window.length - DIFFICULTY_ADAPTIVE_WINDOW_SIZE);
}

function countCorrectAnswers(recentOutcomes: number[]): number {
  return recentOutcomes.reduce(
    (count, outcome) => count + (outcome === 1 ? 1 : 0),
    0,
  );
}

function moveDifficultyByStep(
  ladder: readonly string[],
  currentDifficulty: string,
  step: -1 | 0 | 1,
): string {
  const currentIndex = Math.max(ladder.indexOf(currentDifficulty), 0);
  const nextIndex = Math.min(
    Math.max(currentIndex + step, 0),
    ladder.length - 1,
  );

  return ladder[nextIndex] ?? ladder[0] ?? currentDifficulty;
}

export function getNextDifficultyByRecentAccuracy({
  subcategoryId,
  currentDifficulty,
  recentOutcomes,
  difficultyCooldownRemaining,
  isCorrect,
}: NextDifficultyInput): AdaptiveDifficultyResult {
  const ladder = DIFFICULTY_LADDER_BY_SUBCATEGORY[subcategoryId] as readonly string[];
  if (ladder.length === 0) {
    return {
      difficulty: currentDifficulty,
      recentOutcomes: [],
      difficultyCooldownRemaining: 0,
    };
  }

  const nextRecentOutcomes = appendOutcomeToWindow(recentOutcomes, isCorrect);
  const normalizedCooldown = Math.max(
    0,
    Math.floor(difficultyCooldownRemaining),
  );
  if (normalizedCooldown > 0) {
    return {
      difficulty: currentDifficulty,
      recentOutcomes: nextRecentOutcomes,
      difficultyCooldownRemaining: normalizedCooldown - 1,
    };
  }

  if (nextRecentOutcomes.length < DIFFICULTY_ADAPTIVE_WINDOW_SIZE) {
    return {
      difficulty: moveDifficultyByStep(ladder, currentDifficulty, 0),
      recentOutcomes: nextRecentOutcomes,
      difficultyCooldownRemaining: 0,
    };
  }

  const accuracy =
    countCorrectAnswers(nextRecentOutcomes) / DIFFICULTY_ADAPTIVE_WINDOW_SIZE;
  if (accuracy >= DIFFICULTY_PROMOTE_ACCURACY_THRESHOLD) {
    const nextDifficulty = moveDifficultyByStep(ladder, currentDifficulty, 1);
    return {
      difficulty: nextDifficulty,
      recentOutcomes: nextRecentOutcomes,
      difficultyCooldownRemaining:
        nextDifficulty === currentDifficulty
          ? 0
          : DIFFICULTY_LEVEL_CHANGE_COOLDOWN_SUBMISSIONS,
    };
  }

  if (accuracy < DIFFICULTY_DEMOTE_ACCURACY_THRESHOLD) {
    const nextDifficulty = moveDifficultyByStep(ladder, currentDifficulty, -1);
    return {
      difficulty: nextDifficulty,
      recentOutcomes: nextRecentOutcomes,
      difficultyCooldownRemaining:
        nextDifficulty === currentDifficulty
          ? 0
          : DIFFICULTY_LEVEL_CHANGE_COOLDOWN_SUBMISSIONS,
    };
  }

  return {
    difficulty: moveDifficultyByStep(ladder, currentDifficulty, 0),
    recentOutcomes: nextRecentOutcomes,
    difficultyCooldownRemaining: 0,
  };
}
