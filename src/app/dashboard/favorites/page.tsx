"use client";

import {
  Button,
  Card,
  CardBody,
  Chip,
  Select,
  SelectItem,
} from "@heroui/react";
import { getSubjectIcon } from "@/lib/meta";
import { Star } from "lucide-react";
import { toast } from "@/lib/toast";
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
  const {
    isLoading,
    questions,
    removingQuestionIds,
    removeFavoriteQuestion,
  } = useFavoriteQuestions({
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

  async function handleUnfavoriteQuestion(questionId: string) {
    try {
      await removeFavoriteQuestion(questionId);
      setExpandedQuestionIds((previous) => {
        const next = new Set(previous);
        next.delete(questionId);
        return next;
      });
    } catch (error) {
      toast.error(error, {
        fallbackDescription: "Failed to remove favorite question.",
      });
    }
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
                <CardBody
                  aria-expanded={isExpanded}
                  className="space-y-3 cursor-pointer"
                  onClick={() => toggleExpandedQuestion(question.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleExpandedQuestion(question.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <p>{question.prompt}</p>

                  {isExpanded ? (
                    <div
                      className="space-y-3"
                      onClick={(event) => event.stopPropagation()}
                    >
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

                  <div className="flex items-center justify-end gap-2">
                    <Chip color="primary" size="sm">
                      {question.difficulty}
                    </Chip>

                    <div
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <Button
                        aria-label="Remove favorite question"
                        color="warning"
                        isIconOnly
                        isLoading={removingQuestionIds.has(question.id)}
                        onPress={() => handleUnfavoriteQuestion(question.id)}
                        radius="full"
                        size="sm"
                        variant="light"
                      >
                        <Star aria-hidden className="fill-current" size={18} />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
