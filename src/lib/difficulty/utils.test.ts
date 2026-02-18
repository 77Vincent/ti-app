import { describe, expect, it } from "vitest";
import type { SubcategoryEnum } from "@/lib/meta";
import { getDifficulty } from "./utils";

describe("getDifficulty", () => {
  it("returns mapped real-world level for known subject/subcategory", () => {
    expect(getDifficulty("language", "english", "intermediate")).toEqual({
      framework: "CEFR",
      level: "B1-B2",
    });
  });

  it("returns mapped JLPT level for japanese", () => {
    expect(getDifficulty("language", "japanese", "advanced")).toEqual({
      framework: "JLPT",
      level: "N2",
    });
  });

  it("returns mapped AP level for mathematics", () => {
    expect(getDifficulty("mathematics", "linear-algebra", "expert")).toEqual({
      framework: "AP Math",
      level: "AP Calculus BC",
    });
  });

  it("returns null when no mapping exists", () => {
    expect(
      getDifficulty("language", "unknown" as SubcategoryEnum, "beginner"),
    ).toBeNull();
  });
});
