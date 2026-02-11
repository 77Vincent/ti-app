import { describe, expect, it } from "vitest";
import { GOOGLE_PROVIDER_ID } from "./signIn";

describe("sign-in paths", () => {
  it("exports provider id for Google", () => {
    expect(GOOGLE_PROVIDER_ID).toBe("google");
  });
});
