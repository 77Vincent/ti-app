"use client";

import {
  readTestSession,
} from "@/app/test/run/questionRunner/session/storage";
import { StartForm } from "@/app/test/startForm";
import { PAGE_PATHS } from "@/lib/config/paths";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TestPage() {
  const router = useRouter();
  const [hasActiveSession, setHasActiveSession] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    void readTestSession()
      .then((session) => {
        if (!active) {
          return;
        }

        if (session) {
          router.replace(PAGE_PATHS.TEST_RUN);
          return;
        }

        setHasActiveSession(false);
      })
      .catch(() => {
        if (active) {
          setHasActiveSession(false);
        }
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (hasActiveSession !== false) {
    return null;
  }

  return (
    <section className="flex flex-1 justify-center">
      <StartForm />
    </section>
  );
}
