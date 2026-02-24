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
  readLocalTestSessionRaw,
  writeLocalTestSessionRaw,
} from "@/lib/testSession/adapters/browser/localStorage";
import { QuestionRunnerApiError } from "../api/error";
import { isNonEmptyString } from "@/lib/string";

type TestSessionResponse = {
  session?: unknown;
  error?: unknown;
};

type ReadTestSessionInput = {
  subjectId: SubjectEnum;
  subcategoryId: SubcategoryEnum;
};

type LocalTestSessionSnapshot = {
  sessionId: string;
};

type SessionRequestOptions = {
  body?: string;
  cache?: RequestCache;
  method: "GET" | "POST" | "DELETE" | "PATCH";
  sessionId?: string;
  subjectId?: SubjectEnum;
  subcategoryId?: SubcategoryEnum;
};

function parseSessionFromResponse(payload: unknown): TestSession | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return parseTestSession((payload as TestSessionResponse).session);
}

function readLocalSessionId(): string | null {
  const raw = readLocalTestSessionRaw();
  if (!raw) {
    return null;
  }

  try {
    const payload = JSON.parse(raw) as { sessionId?: unknown };
    return isNonEmptyString(payload.sessionId) ? payload.sessionId : null;
  } catch {
    return null;
  }
}

function writeLocalSessionId(sessionId: string): void {
  const snapshot: LocalTestSessionSnapshot = { sessionId };
  writeLocalTestSessionRaw(JSON.stringify(snapshot));
}

function buildSessionPath(options: SessionRequestOptions): string {
  const params = new URLSearchParams();

  if (isNonEmptyString(options.sessionId)) {
    params.set("sessionId", options.sessionId);
  }

  if (isNonEmptyString(options.subjectId)) {
    params.set("subjectId", options.subjectId);
  }

  if (isNonEmptyString(options.subcategoryId)) {
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

async function readSessionById(sessionId: string): Promise<TestSession | null> {
  const payload = await requestSession({
    cache: "no-store",
    method: "GET",
    sessionId,
  });
  return parseSessionFromResponse(payload);
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
  input?: ReadTestSessionInput,
): Promise<TestSession | null> {
  if (input) {
    return readSessionByContext(input);
  }

  const localSessionId = readLocalSessionId();
  if (!localSessionId) {
    clearLocalTestSessionRaw();
    return null;
  }

  const session = await readSessionById(localSessionId);
  if (!session) {
    clearLocalTestSessionRaw();
    return null;
  }

  return session;
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

  writeLocalSessionId(session.id);
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
