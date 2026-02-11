import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function readRequiredEnv(
  name: "AUTH_GOOGLE_ID" | "AUTH_GOOGLE_SECRET",
): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required for authentication.`);
  }
  return value.trim();
}

function buildAuthOptions(): NextAuthOptions {
  return {
    adapter: PrismaAdapter(prisma),
    providers: [
      GoogleProvider({
        clientId: readRequiredEnv("AUTH_GOOGLE_ID"),
        clientSecret: readRequiredEnv("AUTH_GOOGLE_SECRET"),
        authorization: {
          params: {
            scope: "openid email profile",
          },
        },
      }),
    ],
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
