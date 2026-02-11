import {
  parseTestRunSession,
  type TestRunParams,
  type TestRunSession,
} from "@/lib/validation/testSession";
import { parseHttpErrorMessage } from "@/lib/http/error";
import { API_PATHS } from "@/lib/config/paths";
import { QuestionRunnerApiError } from "../api/error";

type TestSessionResponse = {
  session?: unknown;
  error?: unknown;
};

type SessionRequestOptions = {
  body?: string;
  cache?: RequestCache;
  method: "GET" | "POST" | "DELETE" | "PATCH";
};

function parseSessionFromResponse(payload: unknown): TestRunSession | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return parseTestRunSession((payload as TestSessionResponse).session);
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

export async function readTestSession(): Promise<TestRunSession | null> {
  const payload = await requestSession({
    cache: "no-store",
    method: "GET",
  });

  return parseSessionFromResponse(payload);
}

export async function writeTestSession(
  params: TestRunParams,
): Promise<void> {
  await requestSession({
    body: JSON.stringify(params),
    method: "POST",
  });
}

export async function clearTestSession(): Promise<void> {
  await requestSession({
    method: "DELETE",
  });
}

export async function consumeQuestionQuota(): Promise<void> {
  await requestSession({
    method: "PATCH",
  });
}
