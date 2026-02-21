import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { localTestSessionService } from "./browserLocalSession";

function createLocalStorage() {
  const store = new Map<string, string>();

  return {
    getItem(key: string): string | null {
      return store.get(key) ?? null;
    },
    removeItem(key: string): void {
      store.delete(key);
    },
    setItem(key: string, value: string): void {
      store.set(key, value);
    },
  };
}

describe("local test session", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "window",
      { localStorage: createLocalStorage() } as unknown as Window & typeof globalThis,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("writes and reads local session snapshot", () => {
    localTestSessionService.writeLocalTestSession("session-1");

    expect(localTestSessionService.readLocalTestSessionSnapshot()).toEqual({
      sessionId: "session-1",
    });
  });

  it("returns null for missing or mismatched session snapshot", () => {
    expect(localTestSessionService.readLocalTestSessionSnapshot()).toBeNull();
  });

  it("clears local session snapshot", () => {
    localTestSessionService.writeLocalTestSession("session-1");
    localTestSessionService.clearLocalTestSession();

    expect(localTestSessionService.readLocalTestSessionSnapshot()).toBeNull();
  });
});
