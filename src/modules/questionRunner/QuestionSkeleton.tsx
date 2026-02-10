import { Skeleton } from "@heroui/react";

export default function QuestionSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full rounded-md" />
      <div className="space-y-3 pt-2">
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    </div>
  );
}
