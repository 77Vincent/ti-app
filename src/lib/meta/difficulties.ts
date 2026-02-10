export type DifficultyEnum = "beginner" | "intermediate" | "advanced" | "expert";
export type DifficultyType = {
    id: DifficultyEnum;
    label: string;
    order: number;
};
export const DIFFICULTIES: DifficultyType[] = [
    {
        id: "beginner",
        label: "Beginner",
        order: 1,
    },
    {
        id: "intermediate",
        label: "Intermediate",
        order: 2,
    },
    {
        id: "advanced",
        label: "Advanced",
        order: 3,
    },
    {
        id: "expert",
        label: "Expert",
        order: 4,
    },
];
