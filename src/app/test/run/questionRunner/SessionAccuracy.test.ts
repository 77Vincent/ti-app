import { describe, expect, it } from "vitest";
import {
  formatSessionAccuracyLabel,
  getSessionAccuracyTextClass,
} from "./SessionAccuracy";

describe("formatSessionAccuracyLabel", () => {
  it("formats percent and score counts", () => {
    expect(
      formatSessionAccuracyLabel({
        correctCount: 1,
        submittedCount: 2,
      }),
    ).toBe("50% (1/2)");
  });

  it("rounds accuracy percentage", () => {
    expect(
      formatSessionAccuracyLabel({
        correctCount: 2,
        submittedCount: 3,
      }),
    ).toBe("67% (2/3)");
  });
});

describe("getSessionAccuracyTextClass", () => {
  it("returns error color for accuracy below 25%", () => {
    expect(getSessionAccuracyTextClass(0.24)).toBe("text-red-500");
  });

  it("returns warning color for accuracy between 25% and 50% inclusive", () => {
    expect(getSessionAccuracyTextClass(0.25)).toBe("text-amber-500");
    expect(getSessionAccuracyTextClass(0.5)).toBe("text-amber-500");
  });

  it("returns primary color for accuracy between 50% and 75% inclusive", () => {
    expect(getSessionAccuracyTextClass(0.51)).toBe("text-primary");
    expect(getSessionAccuracyTextClass(0.75)).toBe("text-primary");
  });

  it("returns success color for accuracy above 75%", () => {
    expect(getSessionAccuracyTextClass(0.76)).toBe("text-green-500");
  });
});
