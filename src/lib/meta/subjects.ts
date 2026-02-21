export type SubjectEnum = "language";

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
];
