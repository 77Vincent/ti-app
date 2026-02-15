"use client";

import { Button, Divider } from "@heroui/react";
import { PAGE_PATHS } from "@/lib/config/paths";
import Link from "next/link";
import { HeroBanner } from "./components";
import { PlayIcon } from "lucide-react";
import GlobalStatistics from "./components/statistics/GlobalStatistics";
import BestTestTakers from "./components/statistics/BestTestTakers";


export default function Home() {
  return (
    <div className="space-y-8">
      <section className="mx-auto max-w-5xl space-y-6 sm:space-y-8 px-4 text-center">
        <HeroBanner />

        <div className="space-y-3">
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Learning through <span className="text-primary-500">testing</span>
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl font-light text-default-500">
            Infinite high-quality, tailored questions of various subjects.
          </p>
        </div>

        <Button
          as={Link} color="primary" href={PAGE_PATHS.TEST} size="lg"
          endContent={<PlayIcon size={24} />}
        >
          Start
        </Button>
      </section>

      <GlobalStatistics />

      <BestTestTakers />
    </div>
  );
}
