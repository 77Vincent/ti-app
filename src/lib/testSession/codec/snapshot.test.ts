import { describe, expect, it } from "vitest";
import {
  parseLocalTestSessionSnapshot,
  parseLocalTestSessionSnapshotJson,
} from "./snapshot";

const VALID_SNAPSHOT = {
  sessionId: "session-1",
} as const;

describe("local test session codec", () => {
  it("parses a valid snapshot payload", () => {
    expect(parseLocalTestSessionSnapshot(VALID_SNAPSHOT)).toEqual(VALID_SNAPSHOT);
  });

  it("returns null for malformed json payload", () => {
    expect(parseLocalTestSessionSnapshotJson("not-json")).toBeNull();
  });

  it("rejects snapshot without sessionId", () => {
    expect(
      parseLocalTestSessionSnapshot({
        ...VALID_SNAPSHOT,
        sessionId: "",
      }),
    ).toBeNull();
  });
});
