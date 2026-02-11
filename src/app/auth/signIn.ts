const GOOGLE_PROVIDER_ID = "google";
const SIGN_IN_PAGE_PATH = "/signin";

export function getSignInPagePath(): string {
  return SIGN_IN_PAGE_PATH;
}

export function getGoogleSignInPath(callbackUrl?: string): string {
  const googleSignInPath = `/api/auth/signin/${GOOGLE_PROVIDER_ID}`;

  if (!callbackUrl) {
    return googleSignInPath;
  }

  return `${googleSignInPath}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}
