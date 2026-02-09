"use client";

import { ListBox, Select } from "@heroui/react";
import { useState } from "react";
import {
  DEFAULT_SUBJECT_ID,
  getDefaultSubcategoryId,
  getSubcategoryOptions,
  getSubjectOptions,
} from "../features/test/subjectCatalog";

const subjectOptions = getSubjectOptions();

export default function Home() {
  const [subjectId, setSubjectId] = useState(DEFAULT_SUBJECT_ID);
  const [subcategoryId, setSubcategoryId] = useState(
    getDefaultSubcategoryId(DEFAULT_SUBJECT_ID),
  );

  const subcategoryOptions = getSubcategoryOptions(subjectId);

  const handleSubjectChange = (nextSubjectId: string) => {
    setSubjectId(nextSubjectId);
    setSubcategoryId(getDefaultSubcategoryId(nextSubjectId));
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-4 px-6 py-16">
      <div className="space-y-2">
        <p className="text-sm font-medium">Subject</p>
        <Select
          aria-label="Subject"
          value={subjectId}
          onChange={(key) => handleSubjectChange(String(key ?? DEFAULT_SUBJECT_ID))}
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {subjectOptions.map((subject) => (
                <ListBox.Item key={subject.id} id={subject.id}>
                  {subject.label}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Subcategory</p>
        <Select
          aria-label="Subcategory"
          value={subcategoryId}
          onChange={(key) => setSubcategoryId(String(key ?? ""))}
          isDisabled={subcategoryOptions.length === 0}
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {subcategoryOptions.map((subcategory) => (
                <ListBox.Item key={subcategory.id} id={subcategory.id}>
                  {subcategory.label}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
    </main>
  );
}
