import { describe, expect, it } from "vitest";
import { normalizeMathMarkdown } from "./markdown";

describe("normalizeMathMarkdown", () => {
  it("converts escaped parenthesis delimiters to dollar delimiters", () => {
    expect(
      normalizeMathMarkdown(
        "Which vectors in \\(\\mathbb{R}^3\\) are linearly independent?",
      ),
    ).toBe("Which vectors in $\\mathbb{R}^3$ are linearly independent?");
  });

  it("recovers malformed inline math with missing command slash", () => {
    expect(
      normalizeMathMarkdown(
        "Which vectors in \\(mathbb{R}^3) are linearly independent?",
      ),
    ).toBe("Which vectors in $\\mathbb{R}^3$ are linearly independent?");
  });

  it("adds missing command slash inside dollar-delimited math", () => {
    expect(normalizeMathMarkdown("Compute $frac{1}{2}$ + $sqrt{4}$.")).toBe(
      "Compute $\\frac{1}{2}$ + $\\sqrt{4}$.",
    );
  });

  it("keeps plain text unchanged", () => {
    expect(normalizeMathMarkdown("Linear algebra basics")).toBe(
      "Linear algebra basics",
    );
  });
});

