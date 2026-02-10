import { SubjectEntry } from "./types";

const SUBJECT_CATALOG: SubjectEntry[] = [
    {
        id: "language",
        label: "Language",
        order: 1,
        subcategories: [
            {
                id: "english",
                label: "English",
                disabled: false,
                order: 1,
                questionTypesAllowed: ["multiple_choice", "multiple_answer"],
            },
        ],
    },
    {
        id: "math",
        label: "Mathematics",
        order: 2,
        subcategories: [
            {
                id: "algebra",
                label: "Algebra",
                disabled: false,
                order: 1,
                questionTypesAllowed: ["multiple_choice"],
            },
        ],
    }
];