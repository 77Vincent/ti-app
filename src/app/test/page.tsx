"use client";

import {
  readTestSession,
} from "@/app/test/run/questionRunner/session/storage";
import { StartForm } from "@/app/test/startForm";
import { PAGE_PATHS } from "@/lib/config/paths";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HeroBanner } from "../components";

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
    <section className="relative flex flex-1 justify-center">
      <div aria-hidden className="blur opacity-50 pointer-events-none absolute inset-x-0 top-0 z-0">
        <HeroBanner />
      </div>
      <StartForm />
    </section>
  );
}
