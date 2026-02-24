import { NextResponse } from "next/server";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const USER_SETTINGS_SELECT = {
  isSoundEnabled: true,
  isLargeQuestionTextEnabled: true,
} as const;

type UserSettingsPayload = {
  isSoundEnabled: boolean;
  isLargeQuestionTextEnabled: boolean;
};

function parseSettingsPatch(
  value: unknown,
): Partial<UserSettingsPayload> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as {
    isSoundEnabled?: unknown;
    isLargeQuestionTextEnabled?: unknown;
  };
  const patch: Partial<UserSettingsPayload> = {};

  if ("isSoundEnabled" in payload) {
    if (typeof payload.isSoundEnabled !== "boolean") {
      return null;
    }

    patch.isSoundEnabled = payload.isSoundEnabled;
  }

  if ("isLargeQuestionTextEnabled" in payload) {
    if (typeof payload.isLargeQuestionTextEnabled !== "boolean") {
      return null;
    }

    patch.isLargeQuestionTextEnabled = payload.isLargeQuestionTextEnabled;
  }

  if (Object.keys(patch).length === 0) {
    return null;
  }

  return patch;
}

export async function GET() {
  const userId = await readAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: USER_SETTINGS_SELECT,
  });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ settings: user });
}

export async function PATCH(request: Request) {
  const userId = await readAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const patch = parseSettingsPatch(body);
  if (!patch) {
    return NextResponse.json(
      {
        error:
          "isSoundEnabled and/or isLargeQuestionTextEnabled must be provided as boolean.",
      },
      { status: 400 },
    );
  }

  const settings = await prisma.user.update({
    where: {
      id: userId,
    },
    data: patch,
    select: USER_SETTINGS_SELECT,
  });

  return NextResponse.json({ settings });
}
