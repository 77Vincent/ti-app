import {
  parseLocalTestSessionSnapshotJson,
  type LocalTestSessionSnapshot,
} from "@/lib/testSession/codec/snapshot";

type LocalTestSessionStorageAdapter = {
  clearRaw: () => void;
  readRaw: () => string | null;
  writeRaw: (raw: string) => void;
};

export function createLocalTestSessionService(
  storage: LocalTestSessionStorageAdapter,
) {
  function readLocalTestSessionSnapshot(): LocalTestSessionSnapshot | null {
    const raw = storage.readRaw();
    if (!raw) {
      return null;
    }

    return parseLocalTestSessionSnapshotJson(raw);
  }

  function writeLocalTestSession(sessionId: string): void {
    storage.writeRaw(JSON.stringify({ sessionId }));
  }

  function clearLocalTestSession(): void {
    storage.clearRaw();
  }

  return {
    clearLocalTestSession,
    readLocalTestSessionSnapshot,
    writeLocalTestSession,
  };
}
