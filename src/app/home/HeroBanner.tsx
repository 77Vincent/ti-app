"use client";

import { useEffect, useMemo, useState } from "react";
import { LANGUAGE_WORDS } from "./languageWordBank";

function createSeededRandom(seed: number) {
  let value = seed >>> 0;

  return function next() {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function shuffleDeterministic<T>(items: readonly T[], seed: number): T[] {
  const random = createSeededRandom(seed);
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function buildMixedWordRows(rowCount: number, seed: number): string[][] {
  const random = createSeededRandom(seed);
  const languages = Object.keys(LANGUAGE_WORDS) as Array<keyof typeof LANGUAGE_WORDS>;
  const queues = new Map(
    languages.map((language, index) => [
      language,
      shuffleDeterministic(LANGUAGE_WORDS[language], seed + index + 1),
    ]),
  );
  const rows = Array.from({ length: rowCount }, () => [] as string[]);
  let previousLanguage: (typeof languages)[number] | null = null;
  let rowCursor = 0;

  while (true) {
    const availableLanguages = languages.filter(
      (language) => (queues.get(language)?.length ?? 0) > 0,
    );

    if (availableLanguages.length === 0) {
      break;
    }

    let candidates = availableLanguages.filter((language) => language !== previousLanguage);

    if (candidates.length === 0) {
      candidates = availableLanguages;
    }

    candidates.sort(
      (first, second) =>
        (queues.get(second)?.length ?? 0) - (queues.get(first)?.length ?? 0),
    );

    const topCount = queues.get(candidates[0])?.length ?? 0;
    const balancedPool = candidates.filter(
      (language) => (queues.get(language)?.length ?? 0) >= topCount - 1,
    );
    const selectedLanguage =
      balancedPool[Math.floor(random() * balancedPool.length)] ?? candidates[0];
    const nextWord = queues.get(selectedLanguage)?.shift();

    if (!nextWord) {
      continue;
    }

    rows[rowCursor].push(nextWord);
    rowCursor = (rowCursor + 1) % rowCount;
    previousLanguage = selectedLanguage;
  }

  return rows;
}

type MiniChipVariant = "solidPrimary" | "solidPrimaryDark" | "borderedPrimary";

const MINI_CHIP_VARIANT_CLASSES: Record<MiniChipVariant, string> = {
  solidPrimary: "border-primary bg-primary text-primary-foreground",
  solidPrimaryDark: "border-primary-700 bg-primary-700 text-primary-foreground",
  borderedPrimary: "border-primary bg-content1/30 text-primary",
};

const BASE_MINI_CHIP_VARIANTS: readonly MiniChipVariant[] = [
  "solidPrimary",
  "solidPrimaryDark",
  "borderedPrimary",
] as const;

function buildScatteredMiniChipVariants(length: number, seed: number): MiniChipVariant[] {
  const variants = Array.from(
    { length },
    (_, index) => BASE_MINI_CHIP_VARIANTS[index % BASE_MINI_CHIP_VARIANTS.length],
  );

  return shuffleDeterministic(variants, seed);
}

export default function HeroBanner() {
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    const animationFrameId = window.requestAnimationFrame(() => {
      setSeed(Date.now());
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const heroWordRows = useMemo(() => buildMixedWordRows(5, seed), [seed]);

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--heroui-content1)/0.7)_0%,hsl(var(--heroui-background)/0.9)_100%)]" />
        <div className="relative z-0 flex flex-col gap-1.5 sm:gap-2">
          {heroWordRows.map((row, rowIndex) => {
            const repeatedRow = [...row, ...row, ...row];
            const rowVariants = buildScatteredMiniChipVariants(
              repeatedRow.length,
              seed + rowIndex + 1,
            );

            return (
              <div key={`hero-word-row-${rowIndex}`} className="overflow-hidden">
                <div
                  className={`flex w-max gap-2 ${
                    rowIndex % 2 === 0
                      ? "animate-[heroMarquee_48s_linear_infinite]"
                      : "animate-[heroMarqueeReverse_52s_linear_infinite]"
                  }`}
                >
                  {repeatedRow.map((word, wordIndex) => (
                    <span
                      key={`hero-word-${rowIndex}-${wordIndex}`}
                      className={`inline-flex shrink-0 items-center rounded-lg border px-4 py-1.5 text-sm font-medium whitespace-nowrap ${MINI_CHIP_VARIANT_CLASSES[rowVariants[wordIndex]]}`}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <style jsx>{`
        @keyframes heroMarquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-33.3333%);
          }
        }
        @keyframes heroMarqueeReverse {
          from {
            transform: translateX(-33.3333%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
