"use client";

import {
  clearStoredTestSession,
  parseStoredTestSession,
  TEST_SESSION_STORAGE_KEY,
} from "@/modules/questionRunner/session";
import { QuestionRunner } from "@/modules/questionRunner";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useSyncExternalStore } from "react";

export default function TestRunPage() {
  const router = useRouter();
  const rawSession = useSyncExternalStore(
    () => () => undefined,
    () => sessionStorage.getItem(TEST_SESSION_STORAGE_KEY),
    () => null,
  );

  const params = parseStoredTestSession(rawSession);

  const handleEndTest = useCallback(() => {
    clearStoredTestSession();
    router.push("/test");
  }, [router]);

  useEffect(() => {
    if (!params) {
      router.replace("/test");
    }
  }, [params, router]);

  if (!params) {
    return null;
  }

  return (
    <section className="flex flex-1 items-center justify-center">
      <QuestionRunner
        difficulty={params.difficulty}
        onEndTest={handleEndTest}
        subcategoryId={params.subcategoryId}
        subjectId={params.subjectId}
      />
    </section>
  );
}
