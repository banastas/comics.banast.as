import React, { useMemo } from 'react';
import type { Comic } from '../types/Comic';
import { hasRealCover } from '../utils/covers';

interface CollectionHealthProps {
  comics: Comic[];
}

interface CompletenessMetric {
  label: string;
  filled: number;
  total: number;
}

// How complete the records behind these statistics are. Placeholder cover graphics don't count.
export const CollectionHealth: React.FC<CollectionHealthProps> = ({ comics }) => {
  const metrics = useMemo((): CompletenessMetric[] => [
    { label: 'Cover image', filled: comics.filter((c) => hasRealCover(c.coverImageUrl)).length, total: comics.length },
    { label: 'Current value', filled: comics.filter((c) => c.currentValue !== undefined).length, total: comics.length },
    { label: 'Purchase price', filled: comics.filter((c) => c.purchasePrice !== undefined).length, total: comics.length },
    { label: 'Cover artist', filled: comics.filter((c) => c.coverArtist.trim() !== '').length, total: comics.length },
  ], [comics]);

  return (
    <section aria-labelledby="completeness-heading" className="rounded-xl border border-slate-800 bg-surface-primary p-5 sm:p-6">
      <h2 id="completeness-heading" className="text-base font-semibold text-white">Record completeness</h2>
      <p className="mb-5 mt-1 text-xs text-slate-400">How many comics have each detail recorded.</p>
      <dl className="space-y-3">
        {metrics.map((metric) => {
          const pct = metric.total > 0 ? Math.floor((metric.filled / metric.total) * 100) : 0;
          return (
            <div key={metric.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <dt className="text-slate-300">{metric.label}</dt>
                <dd className="tabular-nums text-slate-300">{metric.filled.toLocaleString('en-US')} of {metric.total.toLocaleString('en-US')} · {pct}%</dd>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-secondary" aria-hidden="true">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </dl>
    </section>
  );
};
