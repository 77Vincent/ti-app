"use client";

import { Card, CardBody } from "@heroui/react";
import type { StatsCardItem } from "@/lib/stats/cards";

type StatsCardsProps = {
  items: readonly StatsCardItem[];
};

export default function StatsCards({ items }: StatsCardsProps) {
  return (
    <section className="grid self-start gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} shadow="sm" className="border border-2 border-primary">
          <CardBody className="gap-1 px-4 py-3">
            <p className="text-sm text-default-500">{item.label}</p>
            <p className="text-2xl font-semibold">{item.value}</p>
          </CardBody>
        </Card>
      ))}
    </section>
  );
}
