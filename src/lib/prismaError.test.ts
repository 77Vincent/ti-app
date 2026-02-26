import { describe, expect, it } from "vitest";
import { isDatabaseUnavailableError } from "./prismaError";

describe("isDatabaseUnavailableError", () => {
  it("returns true for prisma P1001 error code", () => {
    expect(
      isDatabaseUnavailableError({
        code: "P1001",
      }),
    ).toBe(true);
  });

  it("returns true for prisma P2024 error code", () => {
    expect(
      isDatabaseUnavailableError({
        code: "P2024",
      }),
    ).toBe(true);
  });

  it("returns true when error message says database is unreachable", () => {
    expect(
      isDatabaseUnavailableError(
        new Error(
          "Can't reach database server at host:5432",
        ),
      ),
    ).toBe(true);
  });

  it("returns true when error message says connection pool timed out", () => {
    expect(
      isDatabaseUnavailableError(
        new Error(
          "Timed out fetching a new connection from the connection pool.",
        ),
      ),
    ).toBe(true);
  });

  it("returns false for unrelated errors", () => {
    expect(isDatabaseUnavailableError(new Error("something else"))).toBe(false);
    expect(isDatabaseUnavailableError(null)).toBe(false);
  });
});
