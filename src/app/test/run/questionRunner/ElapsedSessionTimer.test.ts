import { describe, expect, it } from "vitest";
import { computeElapsedSessionSeconds } from "./ElapsedSessionTimer";

describe("computeElapsedSessionSeconds", () => {
  it("floors elapsed seconds from milliseconds", () => {
    expect(computeElapsedSessionSeconds(1_000, 2_999)).toBe(1);
  });

  it("returns zero when now is before start", () => {
    expect(computeElapsedSessionSeconds(2_000, 1_500)).toBe(0);
  });
});
