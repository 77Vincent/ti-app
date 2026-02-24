"use client";

import {
  readTestSession,
} from "@/app/test/run/questionRunner/session/storage";
import { QuestionRunner } from "@/app/test/run/questionRunner";
import { PAGE_PATHS } from "@/lib/config/paths";
import type { TestSession } from "@/lib/testSession/validation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TestRunPage() {
  const router = useRouter();
  const [params, setParams] = useState<TestSession | null | undefined>(
    undefined,
  );

  useEffect(() => {
    let active = true;

    void readTestSession()
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
  }, []);

  useEffect(() => {
    if (params === null) {
      router.replace(PAGE_PATHS.TEST);
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
