import { describe, expect, it } from "vitest";
import {
  DEFAULT_SUBJECT_ID,
  getDefaultSubcategoryId,
  getSubcategoryOptions,
  getSubjectOptions,
} from "./subjectCatalog";

describe("subjectCatalog", () => {
  it("exposes Language as the only subject", () => {
    expect(DEFAULT_SUBJECT_ID).toBe("language");
    expect(getSubjectOptions()).toEqual([{ id: "language", label: "Language" }]);
  });

  it("exposes English as the only subcategory for Language", () => {
    expect(getSubcategoryOptions("language")).toEqual([
      { id: "english", label: "English" },
    ]);
    expect(getDefaultSubcategoryId("language")).toBe("english");
  });

  it("returns empty subcategories for unknown subjects", () => {
    expect(getSubcategoryOptions("unknown")).toEqual([]);
    expect(getDefaultSubcategoryId("unknown")).toBe("");
  });
});
