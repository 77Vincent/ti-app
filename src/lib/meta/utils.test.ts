import { describe, expect, it } from "vitest";
import { sortByOrder } from "./utils";

describe("meta utils", () => {
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

});
