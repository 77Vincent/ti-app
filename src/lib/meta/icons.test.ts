import { describe, expect, it } from "vitest";
import { getSubjectIcon } from "./icons";

describe("meta icons", () => {
  it("returns icon for known subject", () => {
    expect(getSubjectIcon("language")).not.toBeNull();
  });
});
