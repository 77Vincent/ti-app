"use client";

import { Card, CardBody } from "@heroui/react";
import CountUp from "react-countup";
import type { StatsCardItem } from "@/lib/stats/cards";

type StatsCardsProps = {
  items: readonly StatsCardItem[];
};

type ParsedStatValue = {
  target: number;
  decimals: number;
  suffix: string;
};

function parseStatValue(value: string): ParsedStatValue {
  const trimmed = value.trim();
  const suffix = trimmed.endsWith("%") ? "%" : "";
  const numericText = (suffix ? trimmed.slice(0, -1) : trimmed).trim();
  const normalizedNumberText = numericText.replaceAll(",", "");
  const target = Number.parseFloat(normalizedNumberText);

  const decimals = normalizedNumberText.includes(".")
    ? normalizedNumberText.split(".")[1].length
    : 0;

  return {
    target,
    decimals,
    suffix,
  };
}

export default function StatsCards({ items }: StatsCardsProps) {
  return (
    <section className="grid self-start gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const parsed = parseStatValue(item.value);

        return (
          <Card isBlurred key={item.label} shadow="md" className="border border-2 border-primary">
            <CardBody className="flex-row items-center justify-between gap-3 px-4 py-3 sm:flex-col sm:items-start sm:justify-start sm:gap-1">
              <p className="text-sm text-default-500">{item.label}</p>
              <p className="text-xl font-semibold sm:text-2xl">
                <CountUp
                  key={`${item.label}-${item.value}`}
                  start={0}
                  end={parsed.target}
                  duration={0.9}
                  separator=","
                  decimals={parsed.decimals}
                  decimal="."
                  suffix={parsed.suffix}
                />
              </p>
            </CardBody>
          </Card>
        );
      })}
    </section>
  );
}
