"use client";

import { Button } from "@heroui/react";
import { PAGE_PATHS } from "@/lib/config/paths";
import Link from "next/link";
import HeroBanner from "./home/HeroBanner";

export default function Home() {
  return (
    <div className="space-y-6">
      <HeroBanner />
      <div
        aria-hidden
        className="mx-auto -mt-2 h-5 w-full max-w-5xl bg-[linear-gradient(180deg,hsl(var(--heroui-primary)/0.18)_0%,transparent_100%)] blur-lg"
      />
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Learning through testing
        </h1>
        <Button as={Link} color="primary" href={PAGE_PATHS.TEST} size="lg">
          Test Now
        </Button>
      </section>
    </div>
  );
}
