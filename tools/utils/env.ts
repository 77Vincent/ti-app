import { config as loadDotenv } from "dotenv";
import { fileURLToPath } from "node:url";

export function loadToolsEnv(importMetaUrl: string): void {
  const dotenvResult = loadDotenv({
    override: false,
    path: fileURLToPath(new URL("../.env", importMetaUrl)),
  });
  if (
    dotenvResult.error &&
    (dotenvResult.error as NodeJS.ErrnoException).code !== "ENOENT"
  ) {
    throw dotenvResult.error;
  }
}
