export type GoalEnum = "study" | "exam";

export type GoalType = {
  id: GoalEnum;
  label: string;
  order: number;
};

export const GOALS: GoalType[] = [
  {
    id: "study",
    label: "Study",
    order: 1,
  },
  {
    id: "exam",
    label: "Exam",
    order: 2,
  },
];
