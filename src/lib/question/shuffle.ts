import type { Question, QuestionOptionIndex } from "./model";

function hashSeed(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seed: number): () => number {
  let value = seed >>> 0;

  return function next() {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function buildShuffledOrder(length: number, random: () => number): number[] {
  const order = Array.from({ length }, (_, index) => index);

  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }

  return order;
}

function remapCorrectOptionIndexes(
  correctOptionIndexes: QuestionOptionIndex[],
  shuffledOrder: number[],
): QuestionOptionIndex[] {
  const shuffledIndexByOriginalIndex = new Map<number, number>();

  shuffledOrder.forEach((originalIndex, shuffledIndex) => {
    shuffledIndexByOriginalIndex.set(originalIndex, shuffledIndex);
  });

  return correctOptionIndexes
    .map((originalIndex) => shuffledIndexByOriginalIndex.get(originalIndex))
    .filter((index): index is number => index !== undefined)
    .sort((first, second) => first - second);
}

export function shuffleQuestionOptions(
  question: Question,
  seedKey: string,
): Question {
  if (question.options.length <= 1) {
    return question;
  }

  const random = createSeededRandom(hashSeed(seedKey));
  const shuffledOrder = buildShuffledOrder(question.options.length, random);
  const shuffledOptions = shuffledOrder.map(
    (originalIndex) => question.options[originalIndex],
  );
  const shuffledCorrectOptionIndexes = remapCorrectOptionIndexes(
    question.correctOptionIndexes,
    shuffledOrder,
  );

  return {
    ...question,
    options: shuffledOptions,
    correctOptionIndexes: shuffledCorrectOptionIndexes,
  };
}
