export {
  DIFFICULTY_DESCRIPTION_BY_SUBCATEGORY,
  DIFFICULTY_LADDER_BY_SUBCATEGORY,
} from "./config";
export {
  getInitialDifficultyForSubcategory,
  getNextDifficultyByRecentAccuracy,
  isDifficultyDowngrade,
  isDifficultyUpgrade,
  isDifficultyAllowedForSubcategory,
} from "./utils";
export type { AdaptiveDifficultyResult } from "./utils";
