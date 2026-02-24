import {
  parseTestSession,
  type TestParam,
  type TestSession,
} from "@/lib/testSession/validation";
import type { SubcategoryEnum, SubjectEnum } from "@/lib/meta";
import { parseHttpErrorMessage } from "@/lib/http/error";
import { API_PATHS } from "@/lib/config/paths";
import {
  clearLocalTestSessionRaw,
} from "@/lib/testSession/adapters/browser/localStorage";
import { QuestionRunnerApiError } from "../api/error";

type TestSessionResponse = {
  session?: unknown;
  error?: unknown;
};

type ReadTestSessionInput = {
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
};

type SessionRequestOptions = {
  body?: string;
  cache?: RequestCache;
  method: "GET" | "POST" | "DELETE" | "PATCH";
  subjectId?: SubjectEnum;
  subcategoryId?: SubcategoryEnum;
};

function parseSessionFromResponse(payload: unknown): TestSession | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return parseTestSession((payload as TestSessionResponse).session);
}

function buildSessionPath(options: SessionRequestOptions): string {
  const params = new URLSearchParams();

  if (options.subjectId) {
    params.set("subjectId", options.subjectId);
  }

  if (options.subcategoryId) {
    params.set("subcategoryId", options.subcategoryId);
  }

  const query = params.toString();
  return query ? `${API_PATHS.TEST_SESSION}?${query}` : API_PATHS.TEST_SESSION;
}

async function requestSession(
  options: SessionRequestOptions,
): Promise<TestSessionResponse | null> {
  const path = buildSessionPath(options);

  const response = await fetch(path, {
    body: options.body,
    cache: options.cache,
    headers: options.body
      ? {
          "content-type": "application/json",
        }
      : undefined,
    method: options.method,
  });

  if (!response.ok) {
    throw new QuestionRunnerApiError(
      await parseHttpErrorMessage(response),
      response.status,
    );
  }

  if (response.status === 204) {
    return null;
  }

  try {
    return (await response.json()) as TestSessionResponse;
  } catch {
    return null;
  }
}

async function readSessionByContext(
  input: ReadTestSessionInput,
): Promise<TestSession | null> {
  const payload = await requestSession({
    cache: "no-store",
    method: "GET",
    subjectId: input.subjectId,
    subcategoryId: input.subcategoryId,
  });

  return parseSessionFromResponse(payload);
}

export async function readTestSession(
  input: ReadTestSessionInput,
): Promise<TestSession | null> {
  return readSessionByContext(input);
}

export async function writeTestSession(
  params: TestParam,
): Promise<void> {
  const payload = await requestSession({
    body: JSON.stringify(params),
    method: "POST",
  });
  const session = parseSessionFromResponse(payload);
  if (!session) {
    throw new QuestionRunnerApiError("Failed to start test session.", 500);
  }
}

export async function clearTestSession(): Promise<void> {
  clearLocalTestSessionRaw();

  await requestSession({
    method: "DELETE",
  });
}

export async function recordQuestionResult(
  sessionId: string,
  isCorrect: boolean,
): Promise<TestSession | null> {
  const payload = await requestSession({
    body: JSON.stringify({ isCorrect, sessionId }),
    method: "PATCH",
  });

  return parseSessionFromResponse(payload);
}
