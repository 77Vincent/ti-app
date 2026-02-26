export function isDatabaseUnavailableError(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (code === "P1001" || code === "P2024") {
      return true;
    }
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("can't reach database server") ||
    message.includes("timed out fetching a new connection") ||
    message.includes("connection pool")
  );
}
