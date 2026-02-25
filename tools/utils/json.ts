export function normalizeAIJsonContent(content: string): string {
  const trimmedContent = content.trim();

  const fencedOnlyMatch = trimmedContent.match(
    /^```(?:json)?\s*([\s\S]*?)\s*```$/i,
  );
  if (fencedOnlyMatch) {
    return fencedOnlyMatch[1].trim();
  }

  const fencedBlockMatch = trimmedContent.match(
    /```(?:json)?\s*([\s\S]*?)\s*```/i,
  );
  if (fencedBlockMatch) {
    return fencedBlockMatch[1].trim();
  }

  return trimmedContent;
}

export function parseAIJson(content: string): unknown {
  return JSON.parse(normalizeAIJsonContent(content));
}
