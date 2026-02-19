import React from 'react';
import { Comic } from '../types/Comic';
import { formatCurrency } from '../utils/formatting';

interface SeriesBreakdownProps {
  comics: Comic[];
  title: string;
  maxItems?: number;
  onViewSeries?: (seriesName: string) => void;
  itemLabel?: string;
}

export const SeriesBreakdown: React.FC<SeriesBreakdownProps> = ({
  comics,
  title,
  maxItems,
  onViewSeries,
  itemLabel = 'issue',
}) => {
  const uniqueSeries = Array.from(new Set(comics.map(c => c.seriesName))).sort();
  if (uniqueSeries.length === 0) return null;

  const displayed = maxItems ? uniqueSeries.slice(0, maxItems) : uniqueSeries;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {displayed.map(series => {
          const seriesComics = comics.filter(c => c.seriesName === series);
          const seriesValue = seriesComics.reduce(
            (sum, c) => sum + (c.currentValue || c.purchasePrice || 0), 0
          );

          return (
            <div
              key={series}
              className="bg-gray-700/30 rounded-lg p-3 border border-gray-600 cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => onViewSeries?.(series)}
            >
              <p className="font-medium text-white text-sm truncate">{series}</p>
              <p className="text-xs text-gray-400">
                {seriesComics.length} {itemLabel}{seriesComics.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-green-400">{formatCurrency(seriesValue)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
