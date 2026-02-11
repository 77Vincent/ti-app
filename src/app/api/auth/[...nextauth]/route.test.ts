import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  googleProvider,
  nextAuth,
  prisma,
  prismaAdapter,
  providerValue,
  requestHandler,
} = vi.hoisted(() => {
  const requestHandler = vi.fn(async () => new Response(null, { status: 200 }));
  const nextAuth = vi.fn(() => requestHandler);
  const prismaAdapterValue = { id: "adapter" };
  const prismaAdapter = vi.fn(() => prismaAdapterValue);
  const providerValue = { id: "google", type: "oauth", name: "Google" };
  const googleProvider = vi.fn(() => providerValue);
  const prisma = { id: "prisma-client" };

  return {
    googleProvider,
    nextAuth,
    prisma,
    prismaAdapter,
    providerValue,
    requestHandler,
  };
});

vi.mock("next-auth", () => ({
  default: nextAuth,
}));

vi.mock("@next-auth/prisma-adapter", () => ({
  PrismaAdapter: prismaAdapter,
}));

vi.mock("next-auth/providers/google", () => ({
  default: googleProvider,
}));

vi.mock("@/lib/prisma", () => ({
  prisma,
}));

const originalEnv = process.env;

describe("next-auth route", () => {
  beforeEach(() => {
    vi.resetModules();
    nextAuth.mockClear();
    prismaAdapter.mockClear();
    googleProvider.mockClear();
    requestHandler.mockClear();

    process.env = {
      ...originalEnv,
      AUTH_GOOGLE_ID: "google-id",
      AUTH_GOOGLE_SECRET: "google-secret",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("runs in node runtime and builds Google auth options", async () => {
    const route = await import("./route");

    expect(route.runtime).toBe("nodejs");

    const request = new Request("http://localhost/api/auth/signin");
    const context = {
      params: {
        nextauth: ["signin"],
      },
    };

    await route.GET(request, context);

    expect(prismaAdapter).toHaveBeenCalledTimes(1);
    expect(prismaAdapter).toHaveBeenCalledWith(prisma);
    expect(googleProvider).toHaveBeenCalledTimes(1);
    expect(googleProvider).toHaveBeenCalledWith({
      clientId: "google-id",
      clientSecret: "google-secret",
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    });
    expect(nextAuth).toHaveBeenCalledTimes(1);
    expect(nextAuth).toHaveBeenCalledWith({
      adapter: { id: "adapter" },
      providers: [providerValue],
      session: {
        strategy: "database",
      },
    });
    expect(requestHandler).toHaveBeenCalledTimes(1);
  });

  it("throws when auth env is missing", async () => {
    const route = await import("./route");
    process.env.AUTH_GOOGLE_ID = "";

    await expect(
      route.GET(new Request("http://localhost/api/auth/signin"), {}),
    ).rejects.toThrowError("AUTH_GOOGLE_ID is required for authentication.");
  });
});
