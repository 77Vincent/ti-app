export function sortByOrder<T extends { order: number }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.order - b.order);
}
