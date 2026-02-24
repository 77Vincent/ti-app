export type SubjectEnum = "language" | "math" | "logic" | "programming";

export type SubjectType = {
  id: SubjectEnum;
  label: string;
  order: number;
};

export const SUBJECTS: SubjectType[] = [
  {
    id: "language",
    label: "Language",
    order: 1,
  },
  {
    id: "math",
    label: "Mathematics",
    order: 2,
  },
  {
    id: "logic",
    label: "Logic",
    order: 3,
  },
  {
    id: "programming",
    label: "Programming",
    order: 4,
  }
];
