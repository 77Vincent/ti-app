export type SubjectEnum =
  "language" | "mathematics" | "computer-science";

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
    id: "mathematics",
    label: "Mathematics",
    order: 2,
  },
  {
    id: "computer-science",
    label: "Computer Science",
    order: 3,
  },
];
