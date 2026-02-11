import { describe, expect, it } from "vitest";
import { parseHttpErrorMessage } from "./error";

describe("parseHttpErrorMessage", () => {
  it("returns payload error when available", async () => {
    const response = new Response(JSON.stringify({ error: "bad request" }), {
      status: 400,
      statusText: "Bad Request",
    });

    await expect(parseHttpErrorMessage(response)).resolves.toBe("bad request");
  });

  it("falls back to payload message when error is absent", async () => {
    const response = new Response(JSON.stringify({ message: "conflict" }), {
      status: 409,
      statusText: "Conflict",
    });

    await expect(parseHttpErrorMessage(response)).resolves.toBe("conflict");
  });

  it("falls back to raw body when payload is not json", async () => {
    const response = new Response("gateway down", {
      status: 502,
      statusText: "Bad Gateway",
    });

    await expect(parseHttpErrorMessage(response)).resolves.toBe("gateway down");
  });

  it("falls back to status text for empty body", async () => {
    const response = new Response("", {
      status: 503,
      statusText: "Service Unavailable",
    });

    await expect(parseHttpErrorMessage(response)).resolves.toBe(
      "Service Unavailable",
    );
  });
});
