export default function QuestionSkeleton() {
    return (
        <div className="space-y-3">
            <div className="skeleton h-12 w-full" />
            <div className="pt-2 space-y-3">
                <div className="skeleton h-8 w-full" />
                <div className="skeleton h-8 w-full" />
                <div className="skeleton h-8 w-full" />
                <div className="skeleton h-8 w-full" />
            </div>
        </div>
    )
}