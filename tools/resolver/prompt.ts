import type { ResolveQuestionRequest } from "../types";
import {
  buildDifficultyDescriptionBlockByLadder,
  type DifficultyDescriptions,
} from "../../shared/difficultyLadder";

export type { DifficultyDescriptions };

export function buildResolverSystemPrompt(
  difficultyFramework: string,
  difficultyLadder: readonly string[],
  difficultyDescriptions: DifficultyDescriptions,
): string {
  const difficultyRubric = buildDifficultyDescriptionBlockByLadder(
    difficultyLadder,
    difficultyDescriptions,
  );

  return `
You are solving one multiple-choice question.
You must also evaluate the question difficulty using the provided ladder and rubric descriptions.
Difficulty rubric:
${difficultyRubric}

Return raw JSON only with this exact shape:
{"a": number, "d": string}

Rules:
- output must be raw JSON only.
- no markdown, no code fences, no extra text.
- a must be a single zero-based index of the correct option.
- d must be one raw difficulty ID from this ladder: ${difficultyLadder.join(", ")}.
- do not include "${difficultyFramework}: " prefix in d.
- d must reflect your own judgment of the question difficulty.
- d must be chosen by comparing the question against every rubric level above.
- avoid defaulting to middle levels; choose the closest rubric match.
- if two levels are equally close, choose the harder level.
`.trim();
}

export function buildResolverUserPrompt(input: ResolveQuestionRequest): string {
  return JSON.stringify(
    {
      p: input.prompt,
      o: input.options.map((option) => option.text),
    },
    null,
    2,
  );
}
