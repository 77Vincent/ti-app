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
import type { TestSession } from "@/lib/testSession/validation";
import { Badge, Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";

export function TestsPanel() {
  const router = useRouter();
  const [ongoingDifficultyBySubcategory, setOngoingDifficultyBySubcategory] =
    useState<Map<SubcategoryEnum, string>>(new Map());

  useEffect(() => {
    let active = true;

    void Promise.all(
      SUBCATEGORIES.map((subcategory) =>
        readTestSession({
          subjectId: subcategory.subjectId,
          subcategoryId: subcategory.id,
        }),
      ),
    )
      .then((sessions) => {
        if (!active) {
          return;
        }

        const nextMap = new Map<SubcategoryEnum, string>();
        sessions
          .filter((session): session is TestSession => session !== null)
          .forEach((session) => {
            nextMap.set(session.subcategoryId, session.difficulty);
          });
        setOngoingDifficultyBySubcategory(nextMap);
      })
      .catch(() => {
        if (active) {
          setOngoingDifficultyBySubcategory(new Map());
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
    const difficulty =
      ongoingDifficultyBySubcategory.get(subcategoryId) ??
      getInitialDifficultyForSubcategory(subcategoryId);

    void writeTestSession({
      subjectId,
      subcategoryId,
      difficulty,
    })
      .then(() => {
        setOngoingDifficultyBySubcategory((previousMap) => {
          const nextMap = new Map(previousMap);
          nextMap.set(subcategoryId, difficulty);
          return nextMap;
        });
        const testRunSearchParams = new URLSearchParams({
          subjectId,
          subcategoryId,
        });
        router.push(`${PAGE_PATHS.TEST_RUN}?${testRunSearchParams.toString()}`);
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

            <div className="flex flex-wrap gap-5">
              {subjectGroup.subcategories.map((subcategory) => {
                const ongoingDifficulty =
                  ongoingDifficultyBySubcategory.get(subcategory.id);
                const button = (
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
                );

                if (ongoingDifficulty) {
                  return (
                    <Badge
                      color="danger"
                      content={ongoingDifficulty}
                      key={subcategory.id}
                    >
                      {button}
                    </Badge>
                  );
                }

                return <Fragment key={subcategory.id}>{button}</Fragment>;
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
