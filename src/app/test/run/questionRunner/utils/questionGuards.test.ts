import { describe, expect, it } from "vitest";
import { QuestionRunnerApiError } from "../api";
import {
  isActiveFavoriteMutation,
  isFavoriteAuthError,
} from "./questionGuards";

describe("isFavoriteAuthError", () => {
  it("returns true only for 401 API errors", () => {
    expect(isFavoriteAuthError(new QuestionRunnerApiError("auth", 401))).toBe(true);
    expect(isFavoriteAuthError(new QuestionRunnerApiError("other", 500))).toBe(false);
    expect(isFavoriteAuthError(new Error("x"))).toBe(false);
  });
});

describe("isActiveFavoriteMutation", () => {
  it("returns true when mutation still targets active question id", () => {
    expect(isActiveFavoriteMutation("q-1", "q-1")).toBe(true);
  });

  it("returns false when question changed during mutation", () => {
    expect(isActiveFavoriteMutation("q-2", "q-1")).toBe(false);
  });
});
