export const BRAND_TITLE = "Ti";
export const BRAND_TAGLINE = "Learning through testing";

export function withBrandTitle(pageTitle: string): string {
  return `${pageTitle} | ${BRAND_TITLE}`;
}
