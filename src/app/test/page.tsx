"use client";

import {
  parseStoredTestSession,
  TEST_SESSION_STORAGE_KEY,
} from "@/modules/questionRunner/session";
import { StartForm } from "@/modules/startForm";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

export default function TestPage() {
  const router = useRouter();
  const rawSession = useSyncExternalStore(
    () => () => undefined,
    () => sessionStorage.getItem(TEST_SESSION_STORAGE_KEY),
    () => null,
  );

  const params = parseStoredTestSession(rawSession);

  useEffect(() => {
    if (params) {
      router.replace("/test/run");
    }
  }, [params, router]);

  if (params) {
    return null;
  }

  return (
    <section className="flex flex-1 items-center justify-center">
      <StartForm />
    </section>
  );
}
