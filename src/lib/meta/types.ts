// Subject Options
export type SubjectCatalog = "language";
export type SubjectOption = {
    id: SubjectCatalog;
    label: string;
};
export const SUBJECT_CATALOGS = {
    LANGUAGE: "language" as SubjectCatalog,
}
export type SubjectEntry = SubjectOption & {
    order: number;
};

// Subcategory Options
export type SubcategoryOption = {
    id: string;
    label: string;
};
export type SubcategoryEntry = SubcategoryOption & {
    subjectId: SubjectCatalog;
    order: number;
    questionTypesAllowed: QuestionType[];
};

// Question Types
export type QuestionType = "multiple_choice" | "multiple_answer";
export const QUESTION_TYPES = {
    MULTIPLE_CHOICE: "multiple_choice" as QuestionType,
    MULTIPLE_ANSWER: "multiple_answer" as QuestionType,
};
