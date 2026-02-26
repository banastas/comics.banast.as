import React, { useMemo } from 'react';
import { Comic } from '../types/Comic';

interface CollectionHealthProps {
  comics: Comic[];
}

interface HealthMetric {
  label: string;
  filled: number;
  total: number;
}

export const CollectionHealth: React.FC<CollectionHealthProps> = ({ comics }) => {
  const metrics = useMemo((): HealthMetric[] => {
    return [
      {
        label: 'Current Value',
        filled: comics.filter((c) => c.currentValue !== undefined).length,
        total: comics.length,
      },
      {
        label: 'Cover Artist',
        filled: comics.filter((c) => c.coverArtist && c.coverArtist.trim() !== '').length,
        total: comics.length,
      },
      {
        label: 'Purchase Price',
        filled: comics.filter((c) => c.purchasePrice !== undefined && c.purchasePrice > 0).length,
        total: comics.length,
      },
      {
        label: 'Notes',
        filled: comics.filter((c) => c.notes && c.notes.trim() !== '').length,
        total: comics.length,
      },
      {
        label: 'Cover Images',
        filled: comics.filter((c) => c.coverImageUrl && c.coverImageUrl.trim() !== '').length,
        total: comics.length,
      },
    ];
  }, [comics]);

  const overallScore = useMemo(() => {
    const totalFilled = metrics.reduce((s, m) => s + m.filled, 0);
    const totalPossible = metrics.reduce((s, m) => s + m.total, 0);
    return Math.round((totalFilled / totalPossible) * 100);
  }, [metrics]);

  return (
    <div className="bg-surface-primary rounded-xl border border-slate-800 p-5 sm:p-6">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="text-base font-semibold text-white">Collection Health</h3>
        <span className={`text-2xl font-bold tabular-nums ${
          overallScore >= 80 ? 'text-emerald-400' : overallScore >= 60 ? 'text-amber-400' : 'text-red-400'
        }`}>
          {overallScore}%
        </span>
      </div>
      <div className="space-y-3">
        {metrics.map((metric) => {
          const pct = Math.round((metric.filled / metric.total) * 100);
          return (
            <div key={metric.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">{metric.label}</span>
                <span className="text-xs text-slate-500 tabular-nums">
                  {metric.filled}/{metric.total}
                </span>
              </div>
              <div className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
