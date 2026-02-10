import { describe, expect, it, vi } from "vitest";
import {
  clearAsyncBuffer,
  consumeAsyncBuffer,
  createAsyncBuffer,
  fillAsyncBuffer,
} from "./index";

describe("asyncBuffer", () => {
  it("fills to capacity and emits snapshots", async () => {
    const buffer = createAsyncBuffer<number>(2);
    const snapshots: number[][] = [];
    let nextValue = 1;

    await fillAsyncBuffer(
      buffer,
      async () => nextValue++,
      (items) => snapshots.push(items),
    );

    expect(buffer.items).toEqual([1, 2]);
    expect(snapshots).toEqual([[1], [1, 2]]);
  });

  it("consumes in FIFO order", async () => {
    const buffer = createAsyncBuffer<string>(2);
    await fillAsyncBuffer(
      buffer,
      async () => (buffer.items.length === 0 ? "A" : "B"),
    );

    expect(consumeAsyncBuffer(buffer)).toBe("A");
    expect(consumeAsyncBuffer(buffer)).toBe("B");
    expect(consumeAsyncBuffer(buffer)).toBeNull();
  });

  it("deduplicates concurrent fill requests", async () => {
    const buffer = createAsyncBuffer<number>(2);
    let callCount = 0;

    const load = vi.fn(async () => {
      callCount += 1;
      await Promise.resolve();
      return callCount;
    });

    await Promise.all([fillAsyncBuffer(buffer, load), fillAsyncBuffer(buffer, load)]);

    expect(load).toHaveBeenCalledTimes(2);
    expect(buffer.items).toEqual([1, 2]);
  });

  it("clears items and emits empty snapshot", async () => {
    const buffer = createAsyncBuffer<number>(2);
    const snapshots: number[][] = [];

    await fillAsyncBuffer(buffer, async () => 1);
    clearAsyncBuffer(buffer, (items) => snapshots.push(items));

    expect(buffer.items).toEqual([]);
    expect(snapshots).toEqual([[]]);
  });
});
