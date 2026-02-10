import { SUBJECT_CATALOG } from "@/lib/subjects/subjects";

export default function StartForm() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-medium text-center">
        Choose the subject of your test
      </h1>
      <div className="flex flex-wrap justify-center gap-2">
        {SUBJECT_CATALOG.map((subject) => (
          <span
            key={subject.id}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm"
          >
            {subject.label}
          </span>
        ))}
      </div>
    </section>
  );
}
