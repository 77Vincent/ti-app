"use client";

import {
  DIFFICULTY_OPTIONS,
  getOrderedSubcategories,
  getOrderedSubjects,
} from "@/lib/meta";
import type { DifficultyLevel } from "@/lib/meta";
import { useMemo, useState } from "react";

export default function StartForm() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(
    null,
  );
  const subjects = useMemo(() => getOrderedSubjects(), []);

  const subcategories = useMemo(() => {
    if (!selectedSubjectId) {
      return [];
    }

    return getOrderedSubcategories(selectedSubjectId);
  }, [selectedSubjectId]);

  const isSubjectStep = !selectedSubjectId;
  const isSubcategoryStep = !!selectedSubjectId && !selectedSubcategoryId;
  const isDifficultyStep = !!selectedSubjectId && !!selectedSubcategoryId;

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedSubcategoryId(null);
    setSelectedDifficulty(null);
  };

  const handleSelectSubcategory = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
    setSelectedDifficulty(null);
  };

  return (
    <div className="card bg-base-100 shadow-sm my-auto">
      <div className="card-body">
        <h1 className="text-2xl font-medium text-center">
          {isSubjectStep && "Choose the subject of your test"}
          {isSubcategoryStep && "Choose the subcategory"}
          {isDifficultyStep && "Choose the difficulty"}
        </h1>

        <div className="flex flex-wrap gap-2">
          {isSubjectStep &&
            subjects.map((subject) => (
              <button
                className="btn btn-primary btn-outline btn-sm"
                key={subject.id}
                onClick={() => handleSelectSubject(subject.id)}
                type="button"
              >
                {subject.label}
              </button>
            ))}

          {isSubcategoryStep &&
            subcategories.map((subcategory) => (
              <button
                className="btn btn-secondary btn-outline btn-sm"
                key={subcategory.id}
                onClick={() => handleSelectSubcategory(subcategory.id)}
                type="button"
              >
                {subcategory.label}
              </button>
            ))}

          {isDifficultyStep &&
            DIFFICULTY_OPTIONS.map((difficulty) => (
              <button
                className={`btn btn-accent btn-outline btn-sm ${
                  selectedDifficulty === difficulty.id ? "btn-active" : ""
                }`}
                key={difficulty.id}
                onClick={() => setSelectedDifficulty(difficulty.id)}
                type="button"
              >
                {difficulty.label}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
