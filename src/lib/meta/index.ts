export { SUBJECTS as SUBJECT_CATALOG, SUBJECT_CATALOGS } from "./subjects";
export { SUBCATEGORY_CATALOG } from "./subcategories";
export { DIFFICULTIES as DIFFICULTY_OPTIONS } from "./difficulties";
export {
  getOrderedSubcategories,
  getOrderedSubjects,
  getSubjectById,
} from "./utils";
export { QUESTION_TYPES } from "./types";
export type {
  QuestionType,
  SubcategoryEntry,
  SubcategoryOption,
} from "./types";
export type { SubjectEnum as SubjectCatalog, SubjectType as SubjectOption } from "./subjects";
export type { DifficultyEnum as DifficultyLevel, DifficultyType as DifficultyOption } from "./difficulties";
