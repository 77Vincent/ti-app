import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { prismaClientConstructor } = vi.hoisted(() => ({
  prismaClientConstructor: vi.fn(function PrismaClientMock() {
    return { id: Symbol("prisma") };
  }),
}));

vi.mock("@prisma/client", () => ({
  PrismaClient: prismaClientConstructor,
}));

const originalNodeEnv = process.env.NODE_ENV;

function clearGlobalPrisma() {
  delete (globalThis as typeof globalThis & { __tiAppPrisma?: unknown })
    .__tiAppPrisma;
}

describe("prisma client singleton", () => {
  beforeEach(() => {
    vi.resetModules();
    prismaClientConstructor.mockClear();
    clearGlobalPrisma();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    clearGlobalPrisma();
  });

  it("reuses one prisma client instance outside production", async () => {
    process.env.NODE_ENV = "development";

    const first = (await import("./prisma")).prisma;
    expect(prismaClientConstructor).toHaveBeenCalledTimes(1);

    vi.resetModules();

    const second = (await import("./prisma")).prisma;

    expect(second).toBe(first);
    expect(prismaClientConstructor).toHaveBeenCalledTimes(1);
  });

  it("does not cache prisma client in production", async () => {
    process.env.NODE_ENV = "production";

    const first = (await import("./prisma")).prisma;

    vi.resetModules();

    const second = (await import("./prisma")).prisma;

    expect(second).not.toBe(first);
    expect(prismaClientConstructor).toHaveBeenCalledTimes(2);
  });
});
