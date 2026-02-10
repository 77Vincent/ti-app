"use client";

import {
  getOrderedSubcategories,
  getOrderedSubjects,
} from "@/lib/subjects";
import { useMemo, useState } from "react";

export default function StartForm() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const subjects = useMemo(() => getOrderedSubjects(), []);

  const subcategories = useMemo(() => {
    if (!selectedSubjectId) {
      return [];
    }

    return getOrderedSubcategories(selectedSubjectId);
  }, [selectedSubjectId]);

  const isSubjectStep = !selectedSubjectId;

  return (
    <div className="card bg-base-100 shadow-sm my-auto">
      <div className="card-body">
        <h1 className="text-2xl font-medium text-center">
          {isSubjectStep ? "Choose the subject of your test" : "Choose the subcategory"}
        </h1>

        <div className="flex flex-wrap gap-2">
          {isSubjectStep &&
            subjects.map((subject) => (
              <button
                className="btn btn-primary btn-outline btn-sm"
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                type="button"
              >
                {subject.label}
              </button>
            ))}

          {!isSubjectStep &&
            subcategories.map((subcategory) => (
              <button
                className="btn btn-secondary btn-outline btn-sm"
                key={subcategory.id}
                type="button"
              >
                {subcategory.label}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
