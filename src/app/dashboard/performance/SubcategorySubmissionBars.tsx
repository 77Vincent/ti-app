"use client";

import { Card, CardBody } from "@heroui/react";
import { getSubjectIcon, type SubjectEnum } from "@/lib/meta";
import { formatPercent } from "./format";

type SubcategorySubmissionItem = {
  label: string;
  subjectId: SubjectEnum;
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
          Top 5 submitted
        </p>

        {totalSubmittedCount === 0 ? null : (
          <div className="space-y-3">
            <div className="flex h-4.5 overflow-hidden rounded-xs bg-default-200">
              {items.map((item, index) => (
                <div
                  className={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
                  key={item.label}
                  style={{ width: `${item.proportionPercent}%` }}
                  title={`${item.label}: ${item.submittedCount.toLocaleString()} (${formatPercent(item.proportionPercent)})`}
                />
              ))}
            </div>

            {items.map((item, index) => {
              const SubjectIcon = getSubjectIcon(item.subjectId);
              return (
              <div
                key={`${item.subjectId}:${item.label}`}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-xs ${SEGMENT_COLORS[index % SEGMENT_COLORS.length]}`}
                  />
                  <span className="inline-flex items-center gap-2">
                    <SubjectIcon aria-hidden size={16} />
                    <span>{item.label}</span>
                  </span>
                </div>
                <span className="tabular-nums text-sm font-medium">
                  {item.submittedCount.toLocaleString()} (
                  {formatPercent(item.proportionPercent)})
                </span>
              </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
