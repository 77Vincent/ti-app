"use client";

import {
  parseStoredTestSession,
  TEST_SESSION_STORAGE_KEY,
} from "@/modules/questionRunner/session";
import { QuestionRunner } from "@/modules/questionRunner";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

export default function TestRunPage() {
  const router = useRouter();
  const rawSession = useSyncExternalStore(
    () => () => undefined,
    () => sessionStorage.getItem(TEST_SESSION_STORAGE_KEY),
    () => null,
  );

  const params = parseStoredTestSession(rawSession);

  useEffect(() => {
    if (!params) {
      router.replace("/test");
    }
  }, [params, router]);

  if (!params) {
    return null;
  }

  return (
    <QuestionRunner
      difficulty={params.difficulty}
      subcategoryId={params.subcategoryId}
      subjectId={params.subjectId}
    />
  );
}
