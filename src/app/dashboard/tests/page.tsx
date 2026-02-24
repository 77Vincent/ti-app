"use client";

import { writeTestSession } from "@/app/test/run/questionRunner/session/storage";
import { PAGE_PATHS } from "@/lib/config/paths";
import { getInitialDifficultyForSubcategory } from "@/lib/difficulty";
import {
  sortByOrder,
  SUBCATEGORIES,
  SUBJECTS,
} from "@/lib/meta";
import type {
  SubcategoryEnum,
  SubjectEnum,
} from "@/lib/meta";
import { toast } from "@/lib/toast";
import { Button, Divider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function DashboardTestsPage() {
  const router = useRouter();
  const subjectGroups = useMemo(() => {
    const sortedSubjects = sortByOrder(SUBJECTS);

    return sortedSubjects.map((subject) => ({
      ...subject,
      subcategories: sortByOrder(
        SUBCATEGORIES.filter(
          (subcategory) => subcategory.subjectId === subject.id,
        ),
      ),
    }));
  }, []);

  function handleSelectSubcategory(
    subjectId: SubjectEnum,
    subcategoryId: SubcategoryEnum,
  ) {
    const difficulty = getInitialDifficultyForSubcategory(subcategoryId);

    void writeTestSession({
      subjectId,
      subcategoryId,
      difficulty,
    })
      .then(() => {
        router.push(PAGE_PATHS.TEST_RUN);
      })
      .catch((error) => {
        toast.error(error, {
          fallbackDescription: "Failed to start test session.",
        });
      });
  }

  return (
    <div className="flex w-full flex-col gap-8">
      {subjectGroups.map((subjectGroup) => (
        <section className="w-full space-y-4" key={subjectGroup.id}>
          <h2 className="text-lg font-semibold">{subjectGroup.label}</h2>

          <div className="flex flex-wrap gap-2">
            {subjectGroup.subcategories.map((subcategory) => (
              <Button
                color="primary"
                key={subcategory.id}
                onPress={() =>
                  handleSelectSubcategory(
                    subjectGroup.id,
                    subcategory.id,
                  )
                }
                variant="bordered"
              >
                {subcategory.label}
              </Button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
