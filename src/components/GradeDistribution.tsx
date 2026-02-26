import React, { useMemo } from 'react';
import { Comic } from '../types/Comic';

interface GradeDistributionProps {
  comics: Comic[];
}

const gradeBuckets = [
  { label: '9.8 - 10.0', min: 9.8, max: 10.0, color: 'bg-amber-400' },
  { label: '9.4 - 9.7', min: 9.4, max: 9.7, color: 'bg-amber-500' },
  { label: '9.0 - 9.3', min: 9.0, max: 9.3, color: 'bg-yellow-600' },
  { label: '8.0 - 8.9', min: 8.0, max: 8.9, color: 'bg-orange-600' },
  { label: '7.0 - 7.9', min: 7.0, max: 7.9, color: 'bg-slate-500' },
  { label: '< 7.0', min: 0, max: 6.9, color: 'bg-slate-600' },
];

export const GradeDistribution: React.FC<GradeDistributionProps> = ({ comics }) => {
  const distribution = useMemo(() => {
    const counts = gradeBuckets.map((bucket) => ({
      ...bucket,
      count: comics.filter((c) => c.grade >= bucket.min && c.grade <= bucket.max).length,
    }));
    const max = Math.max(...counts.map((c) => c.count), 1);
    return counts.map((c) => ({ ...c, percentage: (c.count / max) * 100 }));
  }, [comics]);

  return (
    <div className="bg-surface-primary rounded-xl border border-slate-800 p-5 sm:p-6">
      <h3 className="text-base font-semibold text-white mb-5">Grade Distribution</h3>
      <div className="space-y-3">
        {distribution.map((bucket) => (
          <div key={bucket.label} className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-20 text-right font-mono flex-shrink-0">
              {bucket.label}
            </span>
            <div className="flex-1 h-6 bg-surface-secondary rounded-md overflow-hidden">
              <div
                className={`h-full ${bucket.color} rounded-md transition-all duration-500`}
                style={{ width: `${Math.max(bucket.percentage, bucket.count > 0 ? 2 : 0)}%` }}
              />
            </div>
            <span className="text-xs text-slate-300 w-10 text-right font-mono flex-shrink-0 tabular-nums">
              {bucket.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
