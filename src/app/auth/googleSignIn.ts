const GOOGLE_PROVIDER_ID = "google";

export function getGoogleSignInPath(): string {
  return `/api/auth/signin/${GOOGLE_PROVIDER_ID}`;
}
