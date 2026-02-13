import { describe, expect, it } from "vitest";
import { getDifficulty } from "./utils";

describe("getDifficulty", () => {
  it("returns mapped real-world level for known subject/subcategory", () => {
    expect(getDifficulty("language", "english", "intermediate")).toEqual({
      framework: "CEFR",
      level: "B1-B2",
    });
  });

  it("returns null when no mapping exists", () => {
    expect(getDifficulty("language", "unknown", "beginner")).toBeNull();
  });
});
