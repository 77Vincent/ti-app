import { describe, expect, it } from "vitest";
import {
  GOOGLE_PROVIDER_ID,
  POST_SIGN_IN_CALLBACK_PATH,
  SIGN_IN_PAGE_PATH,
} from "./signIn";

describe("sign-in paths", () => {
  it("exports sign-in page path", () => {
    expect(SIGN_IN_PAGE_PATH).toBe("/signin");
  });

  it("exports provider id for Google", () => {
    expect(GOOGLE_PROVIDER_ID).toBe("google");
  });

  it("exports post-sign-in callback path", () => {
    expect(POST_SIGN_IN_CALLBACK_PATH).toBe("/test");
  });
});
