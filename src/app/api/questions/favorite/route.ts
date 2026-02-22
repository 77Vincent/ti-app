import { NextResponse } from "next/server";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { isNonEmptyString } from "@/lib/string";
import {
  deleteFavoriteQuestion,
  isQuestionFavorited,
  upsertFavoriteQuestion,
} from "./repo";

export const runtime = "nodejs";

function parseQuestionIdPayload(value: unknown): { questionId: string } | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const questionId = (value as { questionId?: unknown }).questionId;
  if (!isNonEmptyString(questionId)) {
    return null;
  }

  return { questionId };
}

function parseQuestionIdFromRequest(
  request: Request,
): { questionId: string } | null {
  const url = new URL(request.url);
  const questionId = url.searchParams.get("questionId");

  if (!isNonEmptyString(questionId)) {
    return null;
  }

  return { questionId };
}

export async function GET(request: Request) {
  const payload = parseQuestionIdFromRequest(request);

  if (!payload) {
    return NextResponse.json(
      { error: "questionId is required." },
      { status: 400 },
    );
  }

  const userId = await readAuthenticatedUserId();

  if (!userId) {
    return NextResponse.json({ isFavorite: false });
  }

  const isFavorite = await isQuestionFavorited(userId, payload.questionId);

  return NextResponse.json({ isFavorite });
}

export async function POST(request: Request) {
  const userId = await readAuthenticatedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseQuestionIdPayload(body);

  if (!input) {
    return NextResponse.json(
      { error: "questionId is required." },
      { status: 400 },
    );
  }

  await upsertFavoriteQuestion(userId, input.questionId);

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const userId = await readAuthenticatedUserId();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = parseQuestionIdPayload(body);

  if (!payload) {
    return NextResponse.json(
      { error: "questionId is required." },
      { status: 400 },
    );
  }

  await deleteFavoriteQuestion(userId, payload.questionId);

  return NextResponse.json({ ok: true });
}
