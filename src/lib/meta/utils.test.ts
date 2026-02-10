import { describe, expect, it } from "vitest";
import {
  getOrderedSubcategories,
  getOrderedSubjects,
  getSubjectById,
  sortByOrder,
} from "./utils";

describe("subjects utils", () => {
  it("sortByOrder sorts entries by ascending order without mutating input", () => {
    const input = [
      { id: "third", order: 3 },
      { id: "first", order: 1 },
      { id: "second", order: 2 },
    ];

    const sorted = sortByOrder(input);

    expect(sorted.map((entry) => entry.id)).toEqual(["first", "second", "third"]);
    expect(input.map((entry) => entry.id)).toEqual(["third", "first", "second"]);
  });

  it("returns ordered subjects", () => {
    expect(getOrderedSubjects().map((subject) => subject.id)).toEqual(["language"]);
  });

  it("returns subject by id", () => {
    const subject = getSubjectById("language");

    expect(subject?.label).toBe("Language");
  });

  it("returns ordered subcategories for a subject", () => {
    expect(
      getOrderedSubcategories("language").map(
        (subcategory) => subcategory.id,
      ),
    ).toEqual(["english"]);
  });
});
