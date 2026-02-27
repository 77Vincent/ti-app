export const BRAND_TITLE = "Ti";
export const BRAND_TAGLINE = "Learning through testing";
export const HOME_DESCRIPTION = "Infinite high-quality questions for adaptive learning.";
export const BRAND_DESCRIPTION =
  "Adaptive practice tests with personalized difficulty across languages, math, logic, programming, and more.";

export function withBrandTitle(pageTitle: string): string {
  return `${pageTitle} | ${BRAND_TITLE}`;
}
