"use client";

import { hasAuthenticatedUser } from "@/app/auth/sessionState";
import { Footer } from "@/app/components";
import { PAGE_PATHS } from "@/lib/config/paths";
import { Button } from "@heroui/react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  function handleStart() {
    void getSession().then((session) => {
      if (hasAuthenticatedUser(session)) {
        router.push(PAGE_PATHS.DASHBOARD);
        return;
      }

      router.push(PAGE_PATHS.TEST);
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 items-center justify-center">
        <section className="mx-auto max-w-5xl space-y-6 sm:space-y-8 px-4 text-center">
          <div className="space-y-3">
            <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Learning through <span className="text-primary-500">testing</span>
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl font-light text-default-500">
              Infinite high-quality questions for adaptive learning.
            </p>
          </div>

          <Button color="primary" onPress={handleStart} radius="full" size="lg">
            Start
          </Button>
        </section>
      </div>
      <Footer />
    </div>
  );
}
