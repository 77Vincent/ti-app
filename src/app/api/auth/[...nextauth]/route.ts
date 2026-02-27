import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function readRequiredEnv(
  name:
    | "AUTH_GOOGLE_ID"
    | "AUTH_GOOGLE_SECRET"
    | "AUTH_MICROSOFT_ID"
    | "AUTH_MICROSOFT_SECRET"
    | "AUTH_MICROSOFT_TENANT_ID",
): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required for authentication.`);
  }
  return value.trim();
}

function buildGoogleProvider() {
  return GoogleProvider({
    clientId: readRequiredEnv("AUTH_GOOGLE_ID"),
    clientSecret: readRequiredEnv("AUTH_GOOGLE_SECRET"),
    allowDangerousEmailAccountLinking: true,
    authorization: {
      params: {
        scope: "openid email profile",
      },
    },
  });
}

function buildMicrosoftProvider() {
  return AzureADProvider({
    clientId: readRequiredEnv("AUTH_MICROSOFT_ID"),
    clientSecret: readRequiredEnv("AUTH_MICROSOFT_SECRET"),
    tenantId: readRequiredEnv("AUTH_MICROSOFT_TENANT_ID"),
    allowDangerousEmailAccountLinking: true,
    authorization: {
      params: {
        scope: "openid email profile",
      },
    },
  });
}

function buildAuthOptions(): NextAuthOptions {
  return {
    adapter: PrismaAdapter(prisma),
    providers: [buildGoogleProvider(), buildMicrosoftProvider()],
    session: {
      strategy: "database",
    },
  };
}

export async function GET(request: Request, context: unknown) {
  const handler = NextAuth(buildAuthOptions());
  return handler(request, context as never);
}

export async function POST(request: Request, context: unknown) {
  const handler = NextAuth(buildAuthOptions());
  return handler(request, context as never);
}
