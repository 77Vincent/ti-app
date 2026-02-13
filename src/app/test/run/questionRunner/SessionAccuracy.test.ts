import { describe, expect, it } from "vitest";
import { formatSessionAccuracyLabel } from "./SessionAccuracy";

describe("formatSessionAccuracyLabel", () => {
  it("formats percent and score counts", () => {
    expect(
      formatSessionAccuracyLabel({
        accuracyRate: 0.5,
        correctCount: 1,
        submittedCount: 2,
      }),
    ).toBe("50% (1/2)");
  });

  it("rounds accuracy percentage", () => {
    expect(
      formatSessionAccuracyLabel({
        accuracyRate: 0.666,
        correctCount: 2,
        submittedCount: 3,
      }),
    ).toBe("67% (2/3)");
  });
});
