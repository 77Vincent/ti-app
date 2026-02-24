"use client";

import {
  readTestSession,
  writeTestSession,
} from "@/app/test/run/questionRunner/session/storage";
import { PAGE_PATHS } from "@/lib/config/paths";
import { getInitialDifficultyForSubcategory } from "@/lib/difficulty";
import {
  getSubjectIcon,
  sortByOrder,
  SUBCATEGORIES,
  SUBJECTS,
} from "@/lib/meta";
import type {
  SubcategoryEnum,
  SubjectEnum,
} from "@/lib/meta";
import { toast } from "@/lib/toast";
import { Badge, Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function DashboardTestsPage() {
  const router = useRouter();
  const [ongoingSubcategoryId, setOngoingSubcategoryId] =
    useState<SubcategoryEnum | null>(null);

  useEffect(() => {
    let active = true;

    void readTestSession()
      .then((session) => {
        if (!active) {
          return;
        }

        setOngoingSubcategoryId(session?.subcategoryId ?? null);
      })
      .catch(() => {
        if (active) {
          setOngoingSubcategoryId(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

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
      {subjectGroups.map((subjectGroup) => {
        const SubjectIcon = getSubjectIcon(subjectGroup.id);

        return (
          <section className="w-full space-y-4" key={subjectGroup.id}>
            <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
              <SubjectIcon aria-hidden size={18} />
              <span>{subjectGroup.label}</span>
            </h2>

            <div className="flex flex-wrap gap-2">
              {subjectGroup.subcategories.map((subcategory) => (
                ongoingSubcategoryId === subcategory.id ? (
                  <Badge color="danger" content="" key={subcategory.id}>
                    <Button
                      color="primary"
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
                  </Badge>
                ) : (
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
                )
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
