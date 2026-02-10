import { SUBJECT_CATALOG } from "@/lib/subjects/subjects";

export default function StartForm() {
  return (
    <div className="card bg-base-100 shadow-sm my-auto">
      <div className="card-body">
        <h1 className="text-2xl font-medium text-center">
          Choose the subject of your test
        </h1>

        <div className="">
          {SUBJECT_CATALOG.map((subject) => (
            <div className="badge badge-lg badge-primary"
              key={subject.id}
            >
              {subject.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
