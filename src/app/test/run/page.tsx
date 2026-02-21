"use client";

import {
  readTestSession,
} from "@/app/test/run/questionRunner/session/storage";
import { QuestionRunner } from "@/app/test/run/questionRunner";
import { PAGE_PATHS } from "@/lib/config/paths";
import type { TestSession } from "@/lib/testSession/validation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HeroBanner } from "@/app/components";

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
    <section className="relative flex flex-1 justify-center">
      <div aria-hidden className="blur opacity-30 pointer-events-none absolute inset-x-0 top-0 z-0">
        <HeroBanner />
      </div>

      <QuestionRunner
        correctCount={params.correctCount}
        id={params.id}
        startedAtMs={params.startedAtMs}
        subcategoryId={params.subcategoryId}
        submittedCount={params.submittedCount}
        subjectId={params.subjectId}
      />
    </section>
  );
}
