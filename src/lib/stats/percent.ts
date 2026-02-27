export function roundToOneDecimalPercent(value: number): number {
  return Math.round(value * 1000) / 10;
}

export function formatPercent(value: number): string {
  if (Number.isInteger(value)) {
    return `${value}%`;
  }

  return `${value.toFixed(1)}%`;
}
