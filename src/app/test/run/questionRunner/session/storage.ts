import {
  parseTestRunParams,
  type TestRunParams,
} from "./params";
import { parseHttpErrorMessage } from "@/lib/http/error";

const TEST_SESSION_API_PATH = "/api/test/session";

type TestSessionResponse = {
  session?: unknown;
  error?: unknown;
};

type SessionRequestOptions = {
  body?: string;
  cache?: RequestCache;
  method: "GET" | "POST" | "DELETE";
};

function parseSessionFromResponse(payload: unknown): TestRunParams | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return parseTestRunParams((payload as TestSessionResponse).session);
}

async function requestSession(
  options: SessionRequestOptions,
): Promise<TestSessionResponse | null> {
  const response = await fetch(TEST_SESSION_API_PATH, {
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
    throw new Error(await parseHttpErrorMessage(response));
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

export async function readTestSession(): Promise<TestRunParams | null> {
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
