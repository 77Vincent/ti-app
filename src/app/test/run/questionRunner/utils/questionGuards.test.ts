import { describe, expect, it } from "vitest";
import { QuestionRunnerApiError } from "../api";
import {
  canSubmitQuestion,
  isActiveFavoriteMutation,
  isFavoriteAuthError,
} from "./questionGuards";

describe("canSubmitQuestion", () => {
  it("returns false when no question is available", () => {
    expect(
      canSubmitQuestion({
        hasQuestion: false,
        hasSubmitted: false,
        selectedOptionCount: 1,
        isSubmitting: false,
        isFavoriteSubmitting: false,
      }),
    ).toBe(false);
  });

  it("returns false during submit or favorite request", () => {
    expect(
      canSubmitQuestion({
        hasQuestion: true,
        hasSubmitted: true,
        selectedOptionCount: 1,
        isSubmitting: true,
        isFavoriteSubmitting: false,
      }),
    ).toBe(false);

    expect(
      canSubmitQuestion({
        hasQuestion: true,
        hasSubmitted: true,
        selectedOptionCount: 1,
        isSubmitting: false,
        isFavoriteSubmitting: true,
      }),
    ).toBe(false);
  });

  it("requires at least one selection before first submit", () => {
    expect(
      canSubmitQuestion({
        hasQuestion: true,
        hasSubmitted: false,
        selectedOptionCount: 0,
        isSubmitting: false,
        isFavoriteSubmitting: false,
      }),
    ).toBe(false);

    expect(
      canSubmitQuestion({
        hasQuestion: true,
        hasSubmitted: false,
        selectedOptionCount: 1,
        isSubmitting: false,
        isFavoriteSubmitting: false,
      }),
    ).toBe(true);
  });

  it("allows submit when user already submitted and requests are idle", () => {
    expect(
      canSubmitQuestion({
        hasQuestion: true,
        hasSubmitted: true,
        selectedOptionCount: 0,
        isSubmitting: false,
        isFavoriteSubmitting: false,
      }),
    ).toBe(true);
  });
});

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
