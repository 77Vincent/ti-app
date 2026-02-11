import { NextResponse } from "next/server";
import { QUESTION_TYPES } from "@/lib/meta";
import { parseTestRunParams } from "@/lib/validation/testSession";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import { isNonEmptyString } from "@/lib/string";
import {
  hasValidCorrectOptionCount,
  isQuestionType,
  parseCorrectOptionIds,
  parseQuestionOptions,
} from "@/lib/validation/question";
import {
  deleteFavoriteQuestion,
  upsertFavoriteQuestion,
  type FavoriteQuestionInput,
} from "./repo";

export const runtime = "nodejs";

function parseFavoriteQuestionInput(value: unknown): FavoriteQuestionInput | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const params = parseTestRunParams(raw);
  const questionId = raw.questionId;
  const questionType = raw.questionType;
  const prompt = raw.prompt;
  const options = parseQuestionOptions(raw.options, { minOptions: 2, maxOptions: 6 });

  if (
    !params ||
    !isNonEmptyString(questionId) ||
    !isQuestionType(questionType) ||
    !isNonEmptyString(prompt) ||
    !options
  ) {
    return null;
  }

  const correctOptionIds = parseCorrectOptionIds(raw.correctOptionIds, options);

  if (!correctOptionIds) {
    return null;
  }

  if (
    questionType === QUESTION_TYPES.MULTIPLE_CHOICE &&
    !hasValidCorrectOptionCount(questionType, correctOptionIds)
  ) {
    return null;
  }

  if (
    questionType === QUESTION_TYPES.MULTIPLE_ANSWER &&
    !hasValidCorrectOptionCount(questionType, correctOptionIds)
  ) {
    return null;
  }

  return {
    ...params,
    questionId,
    questionType,
    prompt: prompt.trim(),
    options,
    correctOptionIds,
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
