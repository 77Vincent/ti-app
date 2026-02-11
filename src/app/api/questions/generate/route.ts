import { NextResponse } from "next/server";
import { parseTestRunParams } from "@/app/test/run/questionRunner/session/params";
import { readAuthenticatedUserId } from "@/app/api/test/session/auth";
import {
  incrementAnonymousQuestionCountCookie,
  MAX_ANONYMOUS_QUESTION_COUNT,
  readAnonymousQuestionCount,
} from "./cookie/anonymousCount";
import { buildQuestion } from "./service/question";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseTestRunParams(body);

  if (!input) {
    return NextResponse.json(
      { error: "subjectId, subcategoryId, and difficulty are required." },
      { status: 400 },
    );
  }

  const userId = await readAuthenticatedUserId();
  const anonymousQuestionCount = userId ? 0 : await readAnonymousQuestionCount();

  if (!userId && anonymousQuestionCount >= MAX_ANONYMOUS_QUESTION_COUNT) {
    return NextResponse.json(
      {
        error: "You have reached the anonymous limit of 5 questions. Please log in to continue.",
      },
      { status: 403 },
    );
  }

  try {
    const question = await buildQuestion(input);
    const response = NextResponse.json({ question });

    if (userId) {
      return response;
    }

    return incrementAnonymousQuestionCountCookie(response, anonymousQuestionCount);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate question.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
