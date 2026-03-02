import { Skeleton } from "@heroui/react";

export default function QuestionSkeleton({className}: {className?: string}) {
  return (
    <div className={`space-y-3 ${className ?? ""}`}>
      <Skeleton className="h-15 w-full rounded-md" />

      <div className="space-y-5 pt-2">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  );
}
