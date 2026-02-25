"use client";

import {
  Card,
  CardBody,
  Select,
  SelectItem,
} from "@heroui/react";
import { getSubjectIcon } from "@/lib/meta";
import { useFavoritesFilters } from "./useFavoritesFilters";
import { useFavoriteQuestions } from "./useFavoriteQuestions";

export default function DashboardFavoritesPage() {
  const {
    subjectFilter,
    subcategoryFilter,
    selectedSubcategoryId,
    subjectFilterOptions,
    subcategoryFilterOptions,
    handleSubjectSelectionChange,
    handleSubcategorySelectionChange,
  } = useFavoritesFilters();
  const { isLoading, questions } = useFavoriteQuestions({
    subjectId: subjectFilter,
    subcategoryId: selectedSubcategoryId,
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="grid w-full gap-4 sm:grid-cols-2">
        <Select
          color="primary"
          disallowEmptySelection
          label="Subject"
          items={subjectFilterOptions}
          variant="bordered"
          selectedKeys={new Set([subjectFilter])}
          onSelectionChange={handleSubjectSelectionChange}
        >
          {(item) => {
            const SubjectIcon = item.subjectId
              ? getSubjectIcon(item.subjectId)
              : null;

            return (
              <SelectItem key={item.id} textValue={item.label}>
                <span className="inline-flex items-center gap-2">
                  {SubjectIcon ? <SubjectIcon aria-hidden size={16} /> : null}
                  <span>{item.label}</span>
                </span>
              </SelectItem>
            );
          }}
        </Select>

        <Select
          color="primary"
          label="Subcategory"
          items={subcategoryFilterOptions}
          variant="bordered"
          selectedKeys={new Set([subcategoryFilter])}
          onSelectionChange={handleSubcategorySelectionChange}
        >
          {(item) => (
            <SelectItem key={item.id}>
              {item.label}
            </SelectItem>
          )}
        </Select>
      </div>

      {isLoading ? (
        <p className="text-default-500">Loading...</p>
      ) : null}

      {!isLoading && questions.length === 0 ? (
        <p className="text-default-500">No favorite questions.</p>
      ) : null}

      {!isLoading && questions.length > 0 ? (
        <div className="flex w-full flex-col gap-3">
          {questions.map((question) => (
            <Card key={question.id} shadow="sm" className="border border-2 border-primary">
              <CardBody>
                <p>{question.prompt}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
