type ErrorResponsePayload = {
  error?: unknown;
  message?: unknown;
};

export async function parseHttpErrorMessage(
  response: Response,
  fallbackMessage = "Request failed.",
): Promise<string> {
  const rawBody = await response.text();

  if (rawBody.trim().length === 0) {
    return response.statusText || fallbackMessage;
  }

  try {
    const payload = JSON.parse(rawBody) as ErrorResponsePayload;

    if (typeof payload.error === "string" && payload.error.trim().length > 0) {
      return payload.error;
    }

    if (typeof payload.message === "string" && payload.message.trim().length > 0) {
      return payload.message;
    }
  } catch {
    // Ignore parse failures and fallback to raw response body.
  }

  return rawBody;
}
