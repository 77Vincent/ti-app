import { describe, expect, it } from "vitest";
import { GOALS } from "./goals";

describe("meta goals", () => {
  it("keeps ids unique", () => {
    const ids = GOALS.map((goal) => goal.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps ids sorted by order", () => {
    const sorted = [...GOALS].sort((a, b) => a.order - b.order);
    expect(GOALS).toEqual(sorted);
  });
});
