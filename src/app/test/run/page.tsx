"use client";

import {
  clearTestSession,
  readTestSession,
  type TestRunParams,
} from "@/app/test/run/questionRunner/session";
import { QuestionRunner } from "@/app/test/run/questionRunner";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function TestRunPage() {
  const router = useRouter();
  const [params, setParams] = useState<TestRunParams | null | undefined>(
    undefined,
  );

  const handleEndTest = useCallback(() => {
    void clearTestSession().catch(() => undefined);
    router.push("/test");
  }, [router]);

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
      router.replace("/test");
    }
  }, [params, router]);

  if (!params) {
    return null;
  }

  return (
    <section className="flex flex-1 justify-center">
      <QuestionRunner
        difficulty={params.difficulty}
        onEndTest={handleEndTest}
        subcategoryId={params.subcategoryId}
        subjectId={params.subjectId}
      />
    </section>
  );
}
