function parseJsonObjectValue(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    throw new Error("AI resolver response was not valid JSON.");
  }
}

function parseIntegerValue(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

export function parseAIResolverAnswer(
  content: string,
  optionCount: number,
): number {
  const parsedValue = parseJsonObjectValue(content);
  if (!parsedValue || typeof parsedValue !== "object") {
    throw new Error("AI resolver response shape is invalid.");
  }

  const answer = parseIntegerValue(
    (parsedValue as Record<string, unknown>).a,
  );
  if (answer === null) {
    throw new Error("AI resolver response shape is invalid.");
  }

  if (answer < 0 || answer >= optionCount) {
    throw new Error("AI resolver answer index is out of range.");
  }

  return answer;
}
