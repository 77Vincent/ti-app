import { Skeleton } from "@heroui/react";

export default function QuestionSkeleton({className}: {className?: string}) {
  return (
    <div className={`space-y-3 ${className ?? ""}`}>
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
