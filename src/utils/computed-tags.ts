import type { Comic } from '../types/Comic';

export const computeTagsForComic = (comic: Comic): string[] => {
  const tags: string[] = [];
  const year = new Date(comic.releaseDate).getFullYear();

  if (year >= 1940 && year < 1950) tags.push('Golden Age');
  else if (year >= 1950 && year < 1970) tags.push('Silver Age');
  else if (year >= 1970 && year < 1985) tags.push('Bronze Age');
  else if (year >= 1985 && year < 1992) tags.push('Copper Age');
  else if (year >= 1992 && year < 2000) tags.push('90s');
  else if (year >= 2000 && year < 2010) tags.push('2000s');
  else if (year >= 2010 && year < 2020) tags.push('2010s');
  else if (year >= 2020) tags.push('Modern');

  if (comic.grade >= 9.8) tags.push('Gem Mint');
  else if (comic.grade >= 9.6) tags.push('High Grade');

  if (comic.issueNumber === 1) tags.push('First Issue');
  if (comic.currentValue !== undefined && comic.currentValue >= 50) tags.push('High Value');

  if (comic.currentValue !== undefined && comic.purchasePrice !== undefined && comic.purchasePrice > 0) {
    const change = ((comic.currentValue - comic.purchasePrice) / comic.purchasePrice) * 100;
    if (change >= 50) tags.push('Appreciating');
    else if (change <= -20) tags.push('Depreciating');
  }

  if (comic.signedBy.trim() !== '') tags.push('Signed');

  return tags;
};

export const computeTagData = (comics: Comic[]) => {
  const computedTagsMap = new Map<string, string[]>();
  const computedTagCounts = new Map<string, number>();

  comics.forEach((comic) => {
    const tags = computeTagsForComic(comic);
    computedTagsMap.set(comic.id, tags);
    tags.forEach((tag) => {
      computedTagCounts.set(tag, (computedTagCounts.get(tag) || 0) + 1);
    });
  });

  const allComputedTags = Array.from(computedTagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  return { computedTagsMap, computedTagCounts, allComputedTags };
};
