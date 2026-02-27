import type { CapacitorConfig } from "@capacitor/cli";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

const DEFAULT_SERVER_URL = "http://localhost:3000";

function normalizeUrl(raw: string): string {
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

const configuredServerUrl = normalizeUrl(
  process.env.CAPACITOR_SERVER_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    DEFAULT_SERVER_URL,
);

const config: CapacitorConfig = {
  appId: "com.ti.app",
  appName: "Ti",
  webDir: "public",
  server: {
    url: configuredServerUrl,
    cleartext: configuredServerUrl.startsWith("http://"),
  },
};

export default config;
