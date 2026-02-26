const LOCALHOST_URL = "http://localhost:3000";

export function readSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || LOCALHOST_URL;
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}
