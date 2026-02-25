"use client";

import {
  Card,
  CardBody,
  Select,
  SelectItem,
} from "@heroui/react";
import { getSubjectIcon } from "@/lib/meta";
import { useState } from "react";
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
  const [expandedQuestionIds, setExpandedQuestionIds] = useState<Set<string>>(
    () => new Set(),
  );

  function toggleExpandedQuestion(questionId: string) {
    setExpandedQuestionIds((previous) => {
      const next = new Set(previous);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }

      return next;
    });
  }

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
          {questions.map((question) => {
            const isExpanded = expandedQuestionIds.has(question.id);

            return (
              <Card key={question.id} shadow="sm" className="border border-2 border-primary">
                <CardBody className="p-0">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => toggleExpandedQuestion(question.id)}
                    className="w-full px-4 py-3 text-left"
                  >
                    <p>{question.prompt}</p>
                  </button>

                  {isExpanded ? (
                    <div className="space-y-2 px-4 pb-3">
                      {question.options.map((option, index) => (
                        <Card
                          key={`${question.id}:${index}`}
                          shadow="none"
                          className="w-full border border-default-300 bg-background"
                        >
                          <CardBody className="px-4 py-2">
                            <p>{option}</p>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  ) : null}
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
