import {
  parseTestSession,
  type TestParam,
  type TestSession,
} from "@/lib/testSession/validation";
import { parseHttpErrorMessage } from "@/lib/http/error";
import { API_PATHS } from "@/lib/config/paths";
import { localTestSessionService } from "@/lib/testSession/service/browserLocalSession";
import { QuestionRunnerApiError } from "../api/error";

type TestSessionResponse = {
  session?: unknown;
  error?: unknown;
};

type SessionRequestOptions = {
  body?: string;
  cache?: RequestCache;
  method: "GET" | "POST" | "DELETE" | "PATCH";
  sessionId?: string;
};

function parseSessionFromResponse(payload: unknown): TestSession | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return parseTestSession((payload as TestSessionResponse).session);
}

async function requestSession(
  options: SessionRequestOptions,
): Promise<TestSessionResponse | null> {
  const path = options.sessionId
    ? `${API_PATHS.TEST_SESSION}?sessionId=${encodeURIComponent(options.sessionId)}`
    : API_PATHS.TEST_SESSION;
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

export async function readTestSession(): Promise<TestSession | null> {
  const localSession = localTestSessionService.readLocalTestSessionSnapshot();
  if (!localSession) {
    localTestSessionService.clearLocalTestSession();
    return null;
  }

  const payload = await requestSession({
    cache: "no-store",
    method: "GET",
    sessionId: localSession.sessionId,
  });
  const session = parseSessionFromResponse(payload);

  if (!session) {
    localTestSessionService.clearLocalTestSession();
    return null;
  }

  if (session.id !== localSession.sessionId) {
    localTestSessionService.clearLocalTestSession();
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

  localTestSessionService.writeLocalTestSession(session.id);
}

export async function clearTestSession(): Promise<void> {
  localTestSessionService.clearLocalTestSession();

  await requestSession({
    method: "DELETE",
  });
}

export async function recordQuestionResult(
  sessionId: string,
  isCorrect: boolean,
): Promise<void> {
  await requestSession({
    body: JSON.stringify({ isCorrect, sessionId }),
    method: "PATCH",
  });
}
