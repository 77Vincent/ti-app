import { NextResponse } from "next/server";
import { parseQuestionParam } from "@/lib/testSession/validation";
import { readAuthenticatedUserId } from "../auth";
import { updateAuthTestSessionDifficultyByContext } from "../repo/testSession";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const authenticatedUserId = await readAuthenticatedUserId();
  if (!authenticatedUserId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseQuestionParam(body);
  if (!input) {
    return NextResponse.json(
      { error: "subjectId, subcategoryId, and difficulty are required." },
      { status: 400 },
    );
  }

  const session = await updateAuthTestSessionDifficultyByContext(
    {
      userId: authenticatedUserId,
      subjectId: input.subjectId,
      subcategoryId: input.subcategoryId,
    },
    input.difficulty,
  );
  if (!session) {
    return NextResponse.json({ error: "Test session not found." }, { status: 404 });
  }

  return NextResponse.json({ session });
}
