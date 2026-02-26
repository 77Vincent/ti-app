export const BRAND_TITLE = "Ti";
export const BRAND_TAGLINE_PREFIX = "Learning through";
export const BRAND_TAGLINE_HIGHLIGHT = "testing";
export const BRAND_TAGLINE = `${BRAND_TAGLINE_PREFIX} ${BRAND_TAGLINE_HIGHLIGHT}`;
export const BRAND_TAGLINE_TITLE_CASE = "Learning Through Testing";

export function withBrandTitle(pageTitle: string): string {
  return `${pageTitle} | ${BRAND_TITLE}`;
}
