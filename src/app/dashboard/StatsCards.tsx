"use client";

import { Card, CardBody } from "@heroui/react";

type StatsItem = {
  label: string;
  value: string;
};

type StatsCardsProps = {
  items: readonly StatsItem[];
};

export default function StatsCards({ items }: StatsCardsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} shadow="sm">
          <CardBody className="gap-1 px-4 py-3">
            <p className="text-sm text-default-500">{item.label}</p>
            <p className="text-2xl font-semibold">{item.value}</p>
          </CardBody>
        </Card>
      ))}
    </section>
  );
}
