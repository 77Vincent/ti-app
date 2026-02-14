import {
  parseTestSession,
  type TestParam,
  type TestSession,
} from "@/lib/testSession/validation";
import { parseHttpErrorMessage } from "@/lib/http/error";
import { API_PATHS } from "@/lib/config/paths";
import { QuestionRunnerApiError } from "../api/error";
import {
  clearLocalTestSession,
  readLocalTestSessionSnapshot,
  writeLocalTestSession,
} from "./local";

type TestSessionResponse = {
  session?: unknown;
  error?: unknown;
};

type SessionRequestOptions = {
  body?: string;
  cache?: RequestCache;
  method: "GET" | "POST" | "DELETE" | "PATCH";
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
  const response = await fetch(API_PATHS.TEST_SESSION, {
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
  const payload = await requestSession({
    cache: "no-store",
    method: "GET",
  });
  const session = parseSessionFromResponse(payload);

  if (!session) {
    clearLocalTestSession();
    return null;
  }

  const localSession = readLocalTestSessionSnapshot();
  const isLocalSessionConsistent =
    localSession !== null && localSession.sessionId === session.id;

  if (!isLocalSessionConsistent) {
    await clearTestSession();
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

  writeLocalTestSession(session.id);
}

export async function clearTestSession(): Promise<void> {
  clearLocalTestSession();

  await requestSession({
    method: "DELETE",
  });
}

export async function recordQuestionResult(isCorrect: boolean): Promise<void> {
  await requestSession({
    body: JSON.stringify({ isCorrect }),
    method: "PATCH",
  });
}
