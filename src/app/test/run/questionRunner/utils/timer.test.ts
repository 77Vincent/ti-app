import { describe, expect, it } from "vitest";
import { formatElapsedTime } from "./timer";

describe("formatElapsedTime", () => {
  it("formats under one hour as mm:ss", () => {
    expect(formatElapsedTime(0)).toBe("00:00");
    expect(formatElapsedTime(59)).toBe("00:59");
    expect(formatElapsedTime(60)).toBe("01:00");
    expect(formatElapsedTime(125)).toBe("02:05");
  });

  it("formats one hour or more as hh:mm:ss", () => {
    expect(formatElapsedTime(3600)).toBe("01:00:00");
    expect(formatElapsedTime(3661)).toBe("01:01:01");
  });
});
