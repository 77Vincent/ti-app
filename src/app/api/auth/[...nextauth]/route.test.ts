import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  azureProvider,
  googleProvider,
  googleProviderValue,
  microsoftProviderValue,
  nextAuth,
  prisma,
  prismaAdapter,
  requestHandler,
} = vi.hoisted(() => {
  const requestHandler = vi.fn(async () => new Response(null, { status: 200 }));
  const nextAuth = vi.fn(() => requestHandler);
  const prismaAdapterValue = { id: "adapter" };
  const prismaAdapter = vi.fn(() => prismaAdapterValue);
  const googleProviderValue = { id: "google", type: "oauth", name: "Google" };
  const microsoftProviderValue = {
    id: "azure-ad",
    type: "oauth",
    name: "Azure AD",
  };
  const googleProvider = vi.fn(() => googleProviderValue);
  const azureProvider = vi.fn(() => microsoftProviderValue);
  const prisma = { id: "prisma-client" };

  return {
    azureProvider,
    googleProvider,
    googleProviderValue,
    microsoftProviderValue,
    nextAuth,
    prisma,
    prismaAdapter,
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

vi.mock("next-auth/providers/azure-ad", () => ({
  default: azureProvider,
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
    azureProvider.mockClear();
    requestHandler.mockClear();

    process.env = {
      ...originalEnv,
      AUTH_GOOGLE_ID: "google-id",
      AUTH_GOOGLE_SECRET: "google-secret",
      AUTH_MICROSOFT_ID: "microsoft-id",
      AUTH_MICROSOFT_SECRET: "microsoft-secret",
      AUTH_MICROSOFT_TENANT_ID: "microsoft-tenant-id",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("runs in node runtime and builds Google and Microsoft auth options", async () => {
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
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    });
    expect(azureProvider).toHaveBeenCalledTimes(1);
    expect(azureProvider).toHaveBeenCalledWith({
      clientId: "microsoft-id",
      clientSecret: "microsoft-secret",
      tenantId: "microsoft-tenant-id",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    });
    expect(nextAuth).toHaveBeenCalledTimes(1);
    expect(nextAuth).toHaveBeenCalledWith({
      adapter: { id: "adapter" },
      providers: [googleProviderValue, microsoftProviderValue],
      session: {
        strategy: "database",
      },
    });
    expect(requestHandler).toHaveBeenCalledTimes(1);
  });

  it("throws when Microsoft auth env is missing", async () => {
    const route = await import("./route");
    process.env.AUTH_MICROSOFT_ID = "";

    await expect(
      route.GET(new Request("http://localhost/api/auth/signin"), {}),
    ).rejects.toThrowError("AUTH_MICROSOFT_ID is required for authentication.");
  });

  it("throws when Google auth env is missing", async () => {
    const route = await import("./route");
    process.env.AUTH_GOOGLE_ID = "";

    await expect(
      route.GET(new Request("http://localhost/api/auth/signin"), {}),
    ).rejects.toThrowError("AUTH_GOOGLE_ID is required for authentication.");
  });
});
