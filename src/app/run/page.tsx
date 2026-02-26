"use client";

import {
  readTestSession,
} from "@/app/run/questionRunner/session/storage";
import { QuestionRunner } from "@/app/run/questionRunner";
import { PAGE_PATHS } from "@/lib/config/paths";
import {
  SUBCATEGORIES,
  type SubcategoryEnum,
  type SubjectEnum,
} from "@/lib/meta";
import { isNonEmptyString } from "@/lib/string";
import type { TestSession } from "@/lib/testSession/validation";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

type SessionContextParams = {
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
};

function parseSessionContextParams(
  searchParams: { get: (name: string) => string | null },
): SessionContextParams | null {
  const subjectId = searchParams.get("subjectId");
  const subcategoryId = searchParams.get("subcategoryId");
  if (!isNonEmptyString(subjectId) || !isNonEmptyString(subcategoryId)) {
    return null;
  }

  const isValidPair = SUBCATEGORIES.some(
    (subcategory) =>
      subcategory.subjectId === subjectId && subcategory.id === subcategoryId,
  );
  if (!isValidPair) {
    return null;
  }

  return {
    subjectId: subjectId as SubjectEnum,
    subcategoryId: subcategoryId as SubcategoryEnum,
  };
}

function TestRunPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contextParams = useMemo(
    () => parseSessionContextParams(searchParams),
    [searchParams],
  );
  const [params, setParams] = useState<TestSession | null | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!contextParams) {
      router.replace(PAGE_PATHS.DASHBOARD);
      return;
    }

    let active = true;

    void readTestSession(contextParams)
      .then((session) => {
        if (active) {
          setParams(session);
        }
      })
      .catch(() => {
        if (active) {
          setParams(null);
        }
      });

    return () => {
      active = false;
    };
  }, [contextParams, router]);

  useEffect(() => {
    if (params === null) {
      router.replace(PAGE_PATHS.DASHBOARD);
    }
  }, [params, router]);

  if (!params) {
    return null;
  }

  return (
    <section className="flex flex-1 justify-center">
      <QuestionRunner
        correctCount={params.correctCount}
        difficulty={params.difficulty}
        id={params.id}
        subcategoryId={params.subcategoryId}
        submittedCount={params.submittedCount}
        subjectId={params.subjectId}
      />
    </section>
  );
}

export default function TestRunPage() {
  return (
    <Suspense fallback={null}>
      <TestRunPageContent />
    </Suspense>
  );
}
