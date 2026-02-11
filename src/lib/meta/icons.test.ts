import { describe, expect, it } from "vitest";
import { getDifficultyIcon, getGoalIcon, getSubjectIcon } from "./icons";

describe("meta icons", () => {
  it("returns icon for known subject", () => {
    expect(getSubjectIcon("language")).not.toBeNull();
  });

  it("returns icon for known difficulty", () => {
    expect(getDifficultyIcon("beginner")).not.toBeNull();
  });

  it("returns icon for known goal", () => {
    expect(getGoalIcon("study")).not.toBeNull();
    expect(getGoalIcon("exam")).not.toBeNull();
  });
});
