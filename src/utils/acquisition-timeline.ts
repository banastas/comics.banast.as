import type { Comic } from '../types/Comic';

const MONTHS_SHOWN = 24;
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// The 24 calendar months ending with the latest purchase. Months without purchases stay on the
// axis as empty bars so gaps read as gaps instead of being silently closed.
export const buildAcquisitionTimeline = (comics: Comic[]) => {
  const byMonth = new Map<number, { count: number; spend: number }>();
  let latest = -Infinity;

  comics.forEach((comic) => {
    const date = new Date(comic.purchaseDate);
    if (Number.isNaN(date.getTime())) return;
    const index = date.getUTCFullYear() * 12 + date.getUTCMonth();
    latest = Math.max(latest, index);
    const existing = byMonth.get(index) || { count: 0, spend: 0 };
    byMonth.set(index, { count: existing.count + 1, spend: existing.spend + (comic.purchasePrice ?? 0) });
  });

  if (!Number.isFinite(latest)) return [];

  const months = Array.from({ length: MONTHS_SHOWN }, (_, i) => latest - MONTHS_SHOWN + 1 + i);
  const maxCount = Math.max(...months.map((index) => byMonth.get(index)?.count ?? 0), 1);

  return months.map((index) => {
    const year = Math.floor(index / 12);
    const month = index % 12;
    const value = byMonth.get(index) ?? { count: 0, spend: 0 };
    return {
      label: `${monthNames[month]} '${String(year).slice(2)}`,
      fullLabel: `${monthNames[month]} ${year}`,
      count: value.count,
      spend: value.spend,
      heightPct: (value.count / maxCount) * 100,
    };
  });
};
