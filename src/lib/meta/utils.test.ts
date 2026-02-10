import { describe, expect, it } from "vitest";
import {
  getEnabledEntries,
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

  it("getEnabledEntries filters out only disabled=true entries", () => {
    const input = [
      { id: "enabled-a" },
      { id: "enabled-b", disabled: false },
      { id: "disabled", disabled: true },
    ];

    const enabled = getEnabledEntries(input);

    expect(enabled.map((entry) => entry.id)).toEqual(["enabled-a", "enabled-b"]);
  });

  it("returns ordered subjects", () => {
    expect(getOrderedSubjects().map((subject) => subject.id)).toEqual([
      "language",
      "math",
      "physics",
      "chemistry",
      "computer_science",
    ]);
  });

  it("returns subject by id", () => {
    const subject = getSubjectById("language");

    expect(subject?.label).toBe("Language");
  });

  it("returns ordered subcategories for a subject", () => {
    expect(
      getOrderedSubcategories("computer_science").map(
        (subcategory) => subcategory.id,
      ),
    ).toEqual(["programming"]);
  });
});
