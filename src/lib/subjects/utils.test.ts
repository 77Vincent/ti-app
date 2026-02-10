import { describe, expect, it } from "vitest";
import {
  getOrderedSubcategories,
  getOrderedSubjects,
  getSubjectById,
} from "./utils";
import { DIFFICULTY_OPTIONS } from "./subjects";

describe("subjects utils", () => {
  it("returns ordered subjects", () => {
    expect(getOrderedSubjects().map((subject) => subject.id)).toEqual([
      "language",
      "math",
    ]);
  });

  it("returns subject by id", () => {
    const subject = getSubjectById("language");

    expect(subject?.label).toBe("Language");
    expect(subject?.subcategories.map((subcategory) => subcategory.id)).toEqual([
      "english",
    ]);
  });

  it("returns null for unknown subject id", () => {
    expect(getSubjectById("unknown")).toBeNull();
  });

  it("returns ordered subcategories for a subject", () => {
    expect(getOrderedSubcategories("math").map((subcategory) => subcategory.id)).toEqual([
      "algebra",
    ]);
  });

  it("returns empty subcategories for unknown subject", () => {
    expect(getOrderedSubcategories("unknown")).toEqual([]);
  });

  it("keeps ordered difficulty options in catalog data", () => {
    expect(DIFFICULTY_OPTIONS.map((difficulty) => difficulty.id)).toEqual([
      "beginner",
      "intermediate",
      "advanced",
      "expert",
    ]);
  });
});
