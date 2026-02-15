"use client";

import { Button } from "@heroui/react";
import { PAGE_PATHS } from "@/lib/config/paths";
import Link from "next/link";
import HeroBanner from "./components/heroBanner/HeroBanner";

export default function Home() {
  return (
    <div className="space-y-8 sm:space-y-10">
      <HeroBanner />

      <section className="mx-auto max-w-5xl space-y-6 sm:space-y-7 px-4 text-center">
        <div className="space-y-3">
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
            Learning through <span className="text-primary-500">testing</span>
          </h1>
          <p className="text-xl sm:text-3xl font-light text-default-500">
            Infinite high-quality, tailored questions.
          </p>
        </div>
        <Button as={Link} color="primary" href={PAGE_PATHS.TEST} size="lg">
          Test Now
        </Button>
      </section>
    </div>
  );
}
