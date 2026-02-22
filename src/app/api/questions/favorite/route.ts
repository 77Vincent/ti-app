import { NextResponse } from "next/server";
import { parseQuestionParam } from "@/lib/testSession/validation";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { isNonEmptyString } from "@/lib/string";
import {
  hasSingleCorrectOption,
  parseCorrectOptionIndexes,
  parseQuestionDifficulty,
  parseQuestionOptions,
} from "@/lib/question/validation";
import { QUESTION_OPTION_LIMITS } from "@/lib/config/questionPolicy";
import {
  deleteFavoriteQuestion,
  isQuestionFavorited,
  upsertFavoriteQuestion,
  type FavoriteQuestionInput,
} from "./repo";

export const runtime = "nodejs";

function parseFavoriteQuestionInput(value: unknown): FavoriteQuestionInput | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const params = parseQuestionParam(raw);
  const questionId = raw.questionId;
  const prompt = raw.prompt;
  const difficulty = parseQuestionDifficulty(raw.difficulty);
  const options = parseQuestionOptions(raw.options, QUESTION_OPTION_LIMITS);

  if (
    !params ||
    !isNonEmptyString(questionId) ||
    !isNonEmptyString(prompt) ||
    !difficulty ||
    !options
  ) {
    return null;
  }

  const correctOptionIndexes = parseCorrectOptionIndexes(
    raw.correctOptionIndexes,
    options,
  );

  if (!correctOptionIndexes) {
    return null;
  }

  if (!hasSingleCorrectOption(correctOptionIndexes)) {
    return null;
  }

  return {
    ...params,
    questionId,
    prompt: prompt.trim(),
    difficulty,
    options,
    correctOptionIndexes,
  };
}

function parseDeletePayload(value: unknown): { questionId: string } | null {
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

  const input = parseFavoriteQuestionInput(body);

  if (!input) {
    return NextResponse.json(
      { error: "Invalid favorite question payload." },
      { status: 400 },
    );
  }

  await upsertFavoriteQuestion(userId, input);

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

  const payload = parseDeletePayload(body);

  if (!payload) {
    return NextResponse.json(
      { error: "questionId is required." },
      { status: 400 },
    );
  }

  await deleteFavoriteQuestion(userId, payload.questionId);

  return NextResponse.json({ ok: true });
}
