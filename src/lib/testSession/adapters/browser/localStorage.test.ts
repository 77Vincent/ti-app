import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearLocalTestSessionRaw,
  readLocalTestSessionRaw,
  writeLocalTestSessionRaw,
} from "./localStorage";

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

describe("local test session store", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "window",
      { localStorage: createLocalStorage() } as unknown as Window & typeof globalThis,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reads and writes raw local session", () => {
    expect(readLocalTestSessionRaw()).toBeNull();

    writeLocalTestSessionRaw("raw-session");

    expect(readLocalTestSessionRaw()).toBe("raw-session");
  });

  it("clears raw local session", () => {
    writeLocalTestSessionRaw("raw-session");
    clearLocalTestSessionRaw();

    expect(readLocalTestSessionRaw()).toBeNull();
  });

  it("returns null without browser localStorage", () => {
    vi.unstubAllGlobals();

    expect(readLocalTestSessionRaw()).toBeNull();
    expect(() => writeLocalTestSessionRaw("raw-session")).not.toThrow();
    expect(() => clearLocalTestSessionRaw()).not.toThrow();
  });
});
