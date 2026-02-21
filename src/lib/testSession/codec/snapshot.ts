import { isNonEmptyString } from "@/lib/string";

export type LocalTestSessionSnapshot = {
  sessionId: string;
};

export function parseLocalTestSessionSnapshot(
  payload: unknown,
): LocalTestSessionSnapshot | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const raw = payload as {
    sessionId?: unknown;
  };

  if (!isNonEmptyString(raw.sessionId)) {
    return null;
  }

  return {
    sessionId: raw.sessionId,
  };
}

export function parseLocalTestSessionSnapshotJson(
  raw: string,
): LocalTestSessionSnapshot | null {
  try {
    return parseLocalTestSessionSnapshot(JSON.parse(raw));
  } catch {
    return null;
  }
}
