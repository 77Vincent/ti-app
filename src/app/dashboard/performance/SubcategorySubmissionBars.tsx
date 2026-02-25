"use client";

import { Card, CardBody } from "@heroui/react";
import { formatPercent } from "./format";

type SubcategorySubmissionItem = {
  label: string;
  proportionPercent: number;
  submittedCount: number;
};

type SubcategorySubmissionBarsProps = {
  items: readonly SubcategorySubmissionItem[];
  totalSubmittedCount: number;
};

const SEGMENT_COLORS = [
  "bg-primary",
  "bg-success",
  "bg-warning",
  "bg-secondary",
  "bg-danger",
] as const;

export default function SubcategorySubmissionBars({
  items,
  totalSubmittedCount,
}: SubcategorySubmissionBarsProps) {
  return (
    <Card shadow="sm" className="border border-2 border-primary">
      <CardBody className="gap-3 px-4 py-3">
        <p className="text-sm text-default-500">
          Submission distribution by subcategory
        </p>

        {totalSubmittedCount === 0 ? (
          <p className="text-sm text-default-500">
            No submitted questions yet.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex h-3 overflow-hidden rounded-full bg-default-200">
              {items.map((item, index) => (
                <div
                  className={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
                  key={item.label}
                  style={{ width: `${item.proportionPercent}%` }}
                  title={`${item.label}: ${item.submittedCount.toLocaleString()} (${formatPercent(item.proportionPercent)})`}
                />
              ))}
            </div>

            {items.map((item, index) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${SEGMENT_COLORS[index % SEGMENT_COLORS.length]}`}
                  />
                  <span>{item.label}</span>
                </div>
                <span className="text-default-500">
                  {item.submittedCount.toLocaleString()} (
                  {formatPercent(item.proportionPercent)})
                </span>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
