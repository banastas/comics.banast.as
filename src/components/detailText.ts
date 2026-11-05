export const plural = (count: number, noun: string): string => `${count.toLocaleString('en-US')} ${noun}${count === 1 ? '' : 's'}`;

export const seriesCountLabel = (count: number, noun: string, seriesCount: number): string =>
  `${plural(count, noun)}${seriesCount > 0 ? ` · ${seriesCount.toLocaleString('en-US')} series` : ''}`;

/** "12 issues in the collection" plus the issue range, e.g. "(#1–#12)", when there is one. */
export const seriesSubtitle = (issueNumbers: number[]): { subtitle: string; note?: string } => {
  const sorted = [...issueNumbers].sort((a, b) => a - b);
  const hasRange = sorted.length > 1 && sorted[0] !== sorted[sorted.length - 1];
  return {
    subtitle: `${plural(sorted.length, 'issue')} in the collection`,
    note: hasRange ? `(#${sorted[0]}–#${sorted[sorted.length - 1]})` : undefined,
  };
};
