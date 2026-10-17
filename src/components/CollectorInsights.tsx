import React, { useMemo } from 'react';
import type { Comic } from '../types/Comic';
import { TrendingUp, Layers, Star, User, BarChart3, Archive, type LucideIcon } from 'lucide-react';
import { formatPercentage, formatWholeCurrency } from '../utils/formatting';

interface CollectorInsightsProps {
  comics: Comic[];
}

interface Insight {
  icon: LucideIcon;
  text: string;
  color: string;
}

export const CollectorInsights: React.FC<CollectorInsightsProps> = ({ comics }) => {
  const insights = useMemo(() => {
    const result: Insight[] = [];
    if (comics.length === 0) return result;

    // Best ROI series
    const seriesMap = new Map<string, { purchase: number; current: number; count: number }>();
    comics.forEach((c) => {
      if (c.currentValue && c.purchasePrice && c.purchasePrice > 0) {
        const existing = seriesMap.get(c.seriesName) || { purchase: 0, current: 0, count: 0 };
        seriesMap.set(c.seriesName, {
          purchase: existing.purchase + c.purchasePrice,
          current: existing.current + c.currentValue,
          count: existing.count + 1,
        });
      }
    });

    let bestRoiSeries = '';
    let bestRoi = -Infinity;
    seriesMap.forEach((v, k) => {
      if (v.count >= 3 && v.purchase > 0) {
        const roi = ((v.current - v.purchase) / v.purchase) * 100;
        if (roi > bestRoi) {
          bestRoi = roi;
          bestRoiSeries = k;
        }
      }
    });
    if (bestRoiSeries) {
      result.push({
        icon: TrendingUp,
        text: `Best-performing series with 3+ priced comics: ${bestRoiSeries} (${formatPercentage(bestRoi)})`,
        color: 'text-emerald-400',
      });
    }

    // Variant percentage
    const variantCount = comics.filter((c) => c.isVariant).length;
    const variantPct = ((variantCount / comics.length) * 100).toFixed(0);
    result.push({
      icon: Layers,
      text: `${variantPct}% of the collection (${variantCount.toLocaleString('en-US')} comics) are variant covers`,
      color: 'text-orange-400',
    });

    // Slabbed vs raw value comparison
    const slabbedComics = comics.filter((c) => c.isSlabbed && c.currentValue);
    const rawComics = comics.filter((c) => !c.isSlabbed && c.currentValue);
    if (slabbedComics.length > 0 && rawComics.length > 0) {
      const avgSlabbed = slabbedComics.reduce((s, c) => s + (c.currentValue || 0), 0) / slabbedComics.length;
      const avgRaw = rawComics.reduce((s, c) => s + (c.currentValue || 0), 0) / rawComics.length;
      const multiplier = (avgSlabbed / avgRaw).toFixed(0);
      result.push({
        icon: Archive,
        text: `Slabbed comics are worth ${multiplier}× more than raw on average (${formatWholeCurrency(avgSlabbed)} vs ${formatWholeCurrency(avgRaw)})`,
        color: 'text-purple-400',
      });
    }

    // Most collected artist
    const artistMap = new Map<string, number>();
    comics.forEach((c) => {
      if (c.coverArtist) {
        artistMap.set(c.coverArtist, (artistMap.get(c.coverArtist) || 0) + 1);
      }
    });
    let topArtist = '';
    let topArtistCount = 0;
    artistMap.forEach((count, artist) => {
      if (count > topArtistCount) {
        topArtistCount = count;
        topArtist = artist;
      }
    });
    if (topArtist) {
      result.push({
        icon: User,
        text: `Most collected artist: ${topArtist} with ${topArtistCount} covers`,
        color: 'text-blue-400',
      });
    }

    // Average grade insight
    const avgGrade = comics.reduce((s, c) => s + c.grade, 0) / comics.length;
    const highGradeCount = comics.filter((c) => c.grade >= 9.4).length;
    const highGradePct = ((highGradeCount / comics.length) * 100).toFixed(0);
    result.push({
      icon: Star,
      text: `${highGradePct}% of the collection is graded 9.4 or higher (average ${avgGrade.toFixed(1)})`,
      color: 'text-amber-400',
    });

    // Comics without current value
    const noValueCount = comics.filter((c) => c.currentValue === undefined).length;
    if (noValueCount > 0) {
      result.push({
        icon: BarChart3,
        text: `${noValueCount} comics don't have a current value yet, so totals may understate the collection`,
        color: 'text-slate-400',
      });
    }

    return result;
  }, [comics]);

  return (
    <div className="bg-surface-primary rounded-xl border border-slate-800 p-5 sm:p-6">
      <h2 className="text-base font-semibold text-white mb-4">Insights</h2>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-3">
            <insight.icon size={16} className={`${insight.color} flex-shrink-0 mt-0.5`} aria-hidden="true" />
            <p className="text-sm text-slate-300 leading-relaxed">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
