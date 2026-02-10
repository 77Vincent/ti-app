type GenericOption = {
    id: string;
    label: string;
};

export type SubjectOption = GenericOption;

export type SubcategoryOption = GenericOption;

export type QuestionType = "multiple_choice" | "multiple_answer";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type SubcategoryEntry = SubcategoryOption & {
    disabled?: boolean;
    order: number;
    questionTypesAllowed: QuestionType[];
};

export type SubjectEntry = SubjectOption & {
    disabled?: boolean;
    order: number;
    subcategories: SubcategoryEntry[];
};

export const QUESTION_TYPES = {
    MULTIPLE_CHOICE: "multiple_choice" as QuestionType,
    MULTIPLE_ANSWER: "multiple_answer" as QuestionType,
};

export const DIFFICULTY_LEVELS = {
    BEGINNER: "beginner" as DifficultyLevel,
    INTERMEDIATE: "intermediate" as DifficultyLevel,
    ADVANCED: "advanced" as DifficultyLevel,
    EXPERT: "expert" as DifficultyLevel,
};