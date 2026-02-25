import {
  SUBCATEGORIES,
  SUBJECTS,
  sortByOrder,
} from "@/lib/meta";
import type {
  SubcategoryEnum,
  SubjectEnum,
} from "@/lib/meta";
import type { SharedSelection } from "@heroui/react";
import { useMemo, useState } from "react";

const ALL_SUBCATEGORIES_KEY = "all";
const DEFAULT_SUBJECT_FILTER = sortByOrder(SUBJECTS)[0].id;

type SubjectFilter = SubjectEnum;
type SubcategoryFilter = SubcategoryEnum | typeof ALL_SUBCATEGORIES_KEY;

type FilterOption = {
  id: string;
  label: string;
  subjectId?: SubjectEnum;
};

function getSingleSelectionKey(selection: SharedSelection): string | null {
  if (selection === "all") {
    return null;
  }

  const [selectedKey] = Array.from(selection);
  if (selectedKey === undefined) {
    return null;
  }

  return String(selectedKey);
}

export function useFavoritesFilters() {
  const [subjectFilter, setSubjectFilter] =
    useState<SubjectFilter>(DEFAULT_SUBJECT_FILTER);
  const [subcategoryFilter, setSubcategoryFilter] =
    useState<SubcategoryFilter>(ALL_SUBCATEGORIES_KEY);

  const subjectOptions = useMemo(() => sortByOrder(SUBJECTS), []);

  const subcategoryOptions = useMemo(() => {
    return sortByOrder(SUBCATEGORIES).filter(
      (subcategory) => subcategory.subjectId === subjectFilter,
    );
  }, [subjectFilter]);

  const subjectFilterOptions = useMemo<FilterOption[]>(
    () =>
      subjectOptions.map((subject) => ({
        id: subject.id,
        label: subject.label,
        subjectId: subject.id,
      })),
    [subjectOptions],
  );

  const subcategoryFilterOptions = useMemo<FilterOption[]>(
    () => [
      {
        id: ALL_SUBCATEGORIES_KEY,
        label: "All subcategories",
      },
      ...subcategoryOptions.map((subcategory) => ({
        id: subcategory.id,
        label: subcategory.label,
      })),
    ],
    [subcategoryOptions],
  );

  function handleSubjectSelectionChange(selection: SharedSelection) {
    const selectedKey = getSingleSelectionKey(selection) as SubjectFilter | null;
    if (!selectedKey) {
      return;
    }

    setSubjectFilter(selectedKey);
    setSubcategoryFilter((currentSubcategory) => {
      if (currentSubcategory === ALL_SUBCATEGORIES_KEY) {
        return currentSubcategory;
      }

      const isCurrentSubcategoryValid = SUBCATEGORIES.some(
        (subcategory) =>
          subcategory.id === currentSubcategory &&
          subcategory.subjectId === selectedKey,
      );

      return isCurrentSubcategoryValid
        ? currentSubcategory
        : ALL_SUBCATEGORIES_KEY;
    });
  }

  function handleSubcategorySelectionChange(selection: SharedSelection) {
    const selectedKey = getSingleSelectionKey(selection) as
      | SubcategoryFilter
      | null;
    if (!selectedKey || selectedKey === ALL_SUBCATEGORIES_KEY) {
      setSubcategoryFilter(ALL_SUBCATEGORIES_KEY);
      return;
    }

    setSubcategoryFilter(selectedKey);
  }

  return {
    subjectFilter,
    subcategoryFilter,
    selectedSubcategoryId:
      subcategoryFilter === ALL_SUBCATEGORIES_KEY
        ? undefined
        : subcategoryFilter,
    subjectFilterOptions,
    subcategoryFilterOptions,
    handleSubjectSelectionChange,
    handleSubcategorySelectionChange,
  };
}
