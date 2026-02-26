import React, { useMemo } from 'react';
import { Comic } from '../types/Comic';

interface AcquisitionTimelineProps {
  comics: Comic[];
}

export const AcquisitionTimeline: React.FC<AcquisitionTimelineProps> = ({ comics }) => {
  const timeline = useMemo(() => {
    const byMonth = new Map<string, { count: number; spend: number }>();

    comics.forEach((comic) => {
      const date = new Date(comic.purchaseDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = byMonth.get(key) || { count: 0, spend: 0 };
      byMonth.set(key, {
        count: existing.count + 1,
        spend: existing.spend + (comic.purchasePrice || 0),
      });
    });

    const sorted = Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-24);

    const maxCount = Math.max(...sorted.map(([, v]) => v.count), 1);

    return sorted.map(([key, value]) => {
      const [year, month] = key.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        label: `${monthNames[parseInt(month) - 1]} '${year.slice(2)}`,
        fullLabel: `${monthNames[parseInt(month) - 1]} ${year}`,
        count: value.count,
        spend: value.spend,
        heightPct: (value.count / maxCount) * 100,
      };
    });
  }, [comics]);

  if (timeline.length === 0) return null;

  const totalSpend = timeline.reduce((sum, t) => sum + t.spend, 0);
  const totalCount = timeline.reduce((sum, t) => sum + t.count, 0);
  const barAreaHeight = 140;

  return (
    <div className="bg-surface-primary rounded-xl border border-slate-800 p-5 sm:p-6">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="text-base font-semibold text-white">Acquisition Timeline</h3>
        <div className="text-xs text-slate-400">
          <span className="tabular-nums">{totalCount}</span> comics &middot;{' '}
          <span className="tabular-nums">${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span> spent
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-[2px] sm:gap-1" style={{ height: `${barAreaHeight}px` }}>
        {timeline.map((month, i) => {
          const barHeight = Math.max(
            (month.heightPct / 100) * barAreaHeight,
            month.count > 0 ? 4 : 0
          );
          return (
            <div
              key={i}
              className="flex-1 relative group"
              style={{ height: '100%' }}
            >
              {/* Bar — positioned at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 rounded-t bg-blue-500/70 hover:bg-blue-400 transition-colors duration-200 cursor-default"
                style={{ height: `${barHeight}px` }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-surface-elevated border border-slate-700 rounded-md px-2 py-1 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                <div className="font-medium">{month.fullLabel}</div>
                <div className="text-slate-400">{month.count} comics &middot; ${month.spend.toFixed(0)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex gap-[2px] sm:gap-1 mt-2">
        {timeline.map((month, i) => (
          <div key={i} className="flex-1 text-center overflow-hidden">
            {(i % 3 === 0 || i === timeline.length - 1) ? (
              <span className="text-[9px] sm:text-[10px] text-slate-500 whitespace-nowrap">{month.label}</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
