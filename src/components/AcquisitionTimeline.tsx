import React, { useMemo } from 'react';
import type { Comic } from '../types/Comic';
import { buildAcquisitionTimeline } from '../utils/acquisition-timeline';
import { formatCurrency, formatWholeCurrency } from '../utils/formatting';

interface AcquisitionTimelineProps {
  comics: Comic[];
}

export const AcquisitionTimeline: React.FC<AcquisitionTimelineProps> = ({ comics }) => {
  const timeline = useMemo(() => buildAcquisitionTimeline(comics), [comics]);

  if (timeline.length === 0) return null;

  const totalSpend = timeline.reduce((sum, t) => sum + t.spend, 0);
  const totalCount = timeline.reduce((sum, t) => sum + t.count, 0);
  const barAreaHeight = 140;

  return (
    <section aria-labelledby="timeline-heading" className="rounded-xl border border-slate-800 bg-surface-primary p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="timeline-heading" className="text-base font-semibold text-white">Acquisitions</h2>
        <p className="text-xs text-slate-400">
          {timeline[0].fullLabel} – {timeline[timeline.length - 1].fullLabel}:{' '}
          <span className="tabular-nums">{totalCount}</span> comics · <span className="tabular-nums">{formatWholeCurrency(totalSpend)}</span> recorded spend
        </p>
      </div>

      <div className="flex items-end gap-[2px] sm:gap-1" style={{ height: `${barAreaHeight}px` }} aria-hidden="true">
        {timeline.map((month, i) => {
          const barHeight = Math.max((month.heightPct / 100) * barAreaHeight, month.count > 0 ? 4 : 1);
          return (
            <div key={month.fullLabel} className="group relative h-full flex-1">
              <div
                className={`absolute bottom-0 left-0 right-0 rounded-t transition-colors duration-200 ${month.count > 0 ? 'bg-blue-500/70 group-hover:bg-blue-400' : 'bg-slate-700/60'}`}
                style={{ height: `${barHeight}px` }}
              />
              <div className={`pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-md border border-slate-700 bg-surface-elevated px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 ${i < 3 ? 'left-0' : i >= timeline.length - 3 ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}>
                <div className="font-medium">{month.fullLabel}</div>
                <div className="text-slate-300">{month.count} comics · {formatWholeCurrency(month.spend)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative mt-2 h-4" aria-hidden="true">
        {timeline.map((month, i) => ((i % 4 === 0 && i < timeline.length - 4) || i === timeline.length - 1) ? (
          <span
            key={month.fullLabel}
            className={`absolute whitespace-nowrap text-[10px] text-slate-400 ${i === timeline.length - 1 ? '-translate-x-full' : i === 0 ? '' : '-translate-x-1/2'}`}
            style={{ left: `${((i + (i === timeline.length - 1 ? 1 : i === 0 ? 0 : 0.5)) / timeline.length) * 100}%` }}
          >
            {month.label}
          </span>
        ) : null)}
      </div>

      <details className="mt-3 text-xs text-slate-300">
        <summary className="cursor-pointer py-2">View monthly data</summary>
        <table className="mt-2 w-full text-left">
          <caption className="sr-only">Acquisitions by month</caption>
          <thead><tr><th scope="col">Month</th><th scope="col">Comics</th><th scope="col" className="text-right">Spent</th></tr></thead>
          <tbody>{timeline.map(month => <tr key={month.fullLabel}>
            <th scope="row" className="py-1 font-normal">{month.fullLabel}</th><td>{month.count}</td><td className="text-right">{formatCurrency(month.spend)}</td>
          </tr>)}</tbody>
        </table>
      </details>
    </section>
  );
};
