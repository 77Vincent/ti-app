import { SUBJECT_CATALOG } from "@/lib/subjects/subjects";
import { Chip } from "@heroui/react";

export default function StartForm() {
  return (
    <>
      <h1 className="text-center text-xl font-semibold">
        Choose the subject of your test
      </h1>
      {
        SUBJECT_CATALOG.map((subject) => (
          <Chip key={subject.id}>
            {subject.label}
          </Chip>
        ))
      }
    </>
  );
}
