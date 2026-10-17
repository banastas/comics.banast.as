import React from 'react';
import type { Comic } from '../types/Comic';
import { formatWholeCurrency } from '../utils/formatting';
import { SiteLink } from './SiteLink';

interface SeriesBreakdownProps {
  comics: Comic[];
  title: string;
  maxItems?: number;
  itemLabel?: string;
}

export const SeriesBreakdown: React.FC<SeriesBreakdownProps> = ({
  comics,
  title,
  maxItems,
  itemLabel = 'issue',
}) => {
  const series = Array.from(
    comics.reduce((map, comic) => {
      const entry = map.get(comic.seriesName) ?? { count: 0, value: 0 };
      entry.count += 1;
      entry.value += comic.currentValue ?? 0;
      return map.set(comic.seriesName, entry);
    }, new Map<string, { count: number; value: number }>())
  ).sort(([a, x], [b, y]) => y.count - x.count || a.localeCompare(b));
  if (series.length === 0) return null;

  const displayed = maxItems ? series.slice(0, maxItems) : series;

  return (
    <div>
      <h3 className="mb-3 text-base font-semibold text-white">
        {title}
        {maxItems && series.length > maxItems && <span className="ml-2 text-sm font-normal text-slate-400">(top {maxItems} of {series.length})</span>}
      </h3>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {displayed.map(([name, { count, value }]) => (
          <li key={name}>
            <SiteLink
              to={{ type: 'series', name }}
              className="block h-full rounded-lg border border-slate-700 bg-surface-secondary/40 p-3 transition-colors hover:border-blue-400"
            >
              <span className="block truncate text-sm font-medium text-white">{name}</span>
              <span className="block text-xs text-slate-400">{count} {itemLabel}{count !== 1 ? 's' : ''}</span>
              <span className="block text-xs text-emerald-300">{value > 0 ? `${formatWholeCurrency(value)} value` : 'No value recorded'}</span>
            </SiteLink>
          </li>
        ))}
      </ul>
    </div>
  );
};
