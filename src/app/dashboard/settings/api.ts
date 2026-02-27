import { API_PATHS } from "@/lib/config/paths";
import { parseHttpErrorMessage } from "@/lib/http/error";
import type { TestSession } from "@/lib/testSession/validation";
import type { SubjectEnum, SubcategoryEnum } from "@/lib/meta";

type UpdateTestSessionDifficultyInput = {
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
  difficulty: string;
};

type TestSessionResponse = {
  session: TestSession;
};

export async function updateTestSessionDifficulty(
  input: UpdateTestSessionDifficultyInput,
): Promise<TestSession> {
  const response = await fetch(API_PATHS.TEST_SESSION_DIFFICULTY, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseHttpErrorMessage(response));
  }

  const payload = (await response.json()) as TestSessionResponse;
  return payload.session;
}
