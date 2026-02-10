export const DIFFICULTY_LEVELS = {
    BEGINNER: "beginner" as DifficultyLevel,
    INTERMEDIATE: "intermediate" as DifficultyLevel,
    ADVANCED: "advanced" as DifficultyLevel,
    EXPERT: "expert" as DifficultyLevel,
};


export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type DifficultyOption = {
    id: DifficultyLevel;
    label: string;
    order: number;
};
export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
    {
        id: DIFFICULTY_LEVELS.BEGINNER,
        label: "Beginner",
        order: 1,
    },
    {
        id: DIFFICULTY_LEVELS.INTERMEDIATE,
        label: "Intermediate",
        order: 2,
    },
    {
        id: DIFFICULTY_LEVELS.ADVANCED,
        label: "Advanced",
        order: 3,
    },
    {
        id: DIFFICULTY_LEVELS.EXPERT,
        label: "Expert",
        order: 4,
    },
];
