"use client";

import { Card, CardBody, Skeleton } from "@heroui/react";
import { getSubjectIcon, type SubjectEnum } from "@/lib/meta";
import { formatPercent } from "@/lib/stats/percent";

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
  isLoading?: boolean;
};

export default function SubcategoryAccuracyBars({
  items,
  isLoading = false,
}: SubcategoryAccuracyBarsProps) {
  return (
    <Card shadow="sm" className="border border-2 border-primary">
      <CardBody className="gap-3 px-4 py-3">
        <p className="text-sm text-default-500">
          Top 5 accuracy
        </p>

        {isLoading ? (
          <Skeleton className="h-4.5 w-full rounded-xs" />
        ) : items.length === 0 ? null : (
          <div className="space-y-3">
            {items.map((item) => {
              const SubjectIcon = getSubjectIcon(item.subjectId);
              const correctPercent =
                item.submittedCount === 0
                  ? 0
                  : (item.correctCount / item.submittedCount) * 100;
              const wrongPercent = Math.max(0, 100 - correctPercent);
              return (
                <div
                  key={`${item.subjectId}:${item.label}`}
                  className="grid grid-cols-[minmax(0,auto)_minmax(160px,1fr)] items-center gap-3"
                >
                  <span className="inline-flex items-center gap-2">
                    <SubjectIcon aria-hidden size={16} />
                    <span>{item.label}</span>
                  </span>
                  <div className="relative flex h-4.5 w-full overflow-hidden rounded-xs bg-default-200">
                    <div
                      className="bg-primary"
                      style={{ width: `${correctPercent}%` }}
                    />
                    <div
                      className="bg-danger"
                      style={{ width: `${wrongPercent}%` }}
                    />
                    <span className="text-background absolute inset-0 flex items-center justify-center text-[13px] font-medium tabular-nums">
                      {item.correctCount.toLocaleString()}/
                      {item.submittedCount.toLocaleString()} (
                      {formatPercent(item.accuracyRatePercent)})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
