"use client";

import { Card, CardBody } from "@heroui/react";
import { getSubjectIcon, type SubjectEnum } from "@/lib/meta";
import { formatPercent } from "./format";

type SubcategoryAccuracyItem = {
  label: string;
  subjectId: SubjectEnum;
  proportionPercent: number;
  accuracyRatePercent: number;
  submittedCount: number;
  correctCount: number;
};

type SubcategoryAccuracyBarsProps = {
  items: readonly SubcategoryAccuracyItem[];
};

export default function SubcategoryAccuracyBars({
  items,
}: SubcategoryAccuracyBarsProps) {
  return (
    <Card shadow="sm" className="border border-2 border-primary">
      <CardBody className="gap-3 px-4 py-3">
        <p className="text-sm text-default-500">
          Top 5 subcategories by accuracy
        </p>

        {items.length === 0 ? null : (
          <div className="space-y-3">
            {items.map((item) => {
              const SubjectIcon = getSubjectIcon(item.subjectId);
              return (
                <div
                  key={`${item.subjectId}:${item.label}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="inline-flex items-center gap-2">
                    <SubjectIcon aria-hidden size={14} />
                    <span>{item.label}</span>
                  </span>
                  <span className="text-default-500">
                    {item.correctCount.toLocaleString()}/
                    {item.submittedCount.toLocaleString()} (
                    {formatPercent(item.accuracyRatePercent)})
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
