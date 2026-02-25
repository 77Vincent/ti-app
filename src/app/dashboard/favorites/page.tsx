"use client";

import {
  Card,
  CardBody,
  Chip,
  Select,
  SelectItem,
} from "@heroui/react";
import { FavoriteIconButton } from "@/app/components";
import { getSubjectIcon } from "@/lib/meta";
import { toast } from "@/lib/toast";
import { useState } from "react";
import QuestionChoice from "@/app/test/run/questionRunner/components/QuestionChoice";
import QuestionPrompt from "@/app/test/run/questionRunner/components/QuestionPrompt";
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
                  <QuestionPrompt markdown={question.prompt} />

                  {isExpanded ? (
                    <div
                      className="space-y-3"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {question.options.map((option, index) => {
                        const isCorrect = question.correctOptionIndexes.includes(index);
                        return (
                          <QuestionChoice
                            key={`${question.id}:${index}`}
                            option={option}
                            hasSubmitted
                            isSelected={false}
                            isCorrect={isCorrect}
                            isWrongSelection={!isCorrect}
                            onSelect={() => {}}
                          />
                        );
                      })}
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
                      <FavoriteIconButton
                        isFavorite
                        isLoading={removingQuestionIds.has(question.id)}
                        onPress={() => handleUnfavoriteQuestion(question.id)}
                        size="sm"
                      />
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
