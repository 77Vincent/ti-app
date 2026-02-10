// Subject Options
export type SubjectCatalog = "math" | "language" | "physics" | "chemistry" | "computer_science";
export type SubjectOption = {
    id: SubjectCatalog;
    label: string;
};
export const SUBJECT_CATALOGS = {
    MATH: "math" as SubjectCatalog,
    LANGUAGE: "language" as SubjectCatalog,
    PHYSICS: "physics" as SubjectCatalog,
    CHEMISTRY: "chemistry" as SubjectCatalog,
    COMPUTER_SCIENCE: "computer_science" as SubjectCatalog,
}
export type SubjectEntry = SubjectOption & {
    disabled?: boolean;
    order: number;
    subcategories: SubcategoryEntry[];
};

// Subcategory Options
export type SubcategoryOption = {
    id: string;
    label: string;
};
export type SubcategoryEntry = SubcategoryOption & {
    disabled?: boolean;
    order: number;
    questionTypesAllowed: QuestionType[];
};

// Question Types
export type QuestionType = "multiple_choice" | "multiple_answer";
export const QUESTION_TYPES = {
    MULTIPLE_CHOICE: "multiple_choice" as QuestionType,
    MULTIPLE_ANSWER: "multiple_answer" as QuestionType,
};
