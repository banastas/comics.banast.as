import React, { useMemo } from 'react';
import { Comic } from '../types/Comic';
import { TrendingUp, Layers, Star, User, BarChart3, Archive } from 'lucide-react';

interface CollectorInsightsProps {
  comics: Comic[];
}

interface Insight {
  icon: React.FC<{ size: number; className?: string }>;
  text: string;
  color: string;
}

export const CollectorInsights: React.FC<CollectorInsightsProps> = ({ comics }) => {
  const insights = useMemo(() => {
    const result: Insight[] = [];

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
        text: `Best ROI series: ${bestRoiSeries} at +${bestRoi.toFixed(0)}% return`,
        color: 'text-emerald-400',
      });
    }

    // Variant percentage
    const variantCount = comics.filter((c) => c.isVariant).length;
    const variantPct = ((variantCount / comics.length) * 100).toFixed(0);
    result.push({
      icon: Layers,
      text: `${variantPct}% of your collection (${variantCount}) are variant covers`,
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
        text: `Slabbed comics average ${multiplier}x more value than raw ($${avgSlabbed.toFixed(0)} vs $${avgRaw.toFixed(0)})`,
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
      text: `${highGradePct}% of your collection is graded 9.4 or higher (avg: ${avgGrade.toFixed(1)})`,
      color: 'text-amber-400',
    });

    // Comics without current value
    const noValueCount = comics.filter((c) => c.currentValue === undefined).length;
    if (noValueCount > 0) {
      result.push({
        icon: BarChart3,
        text: `${noValueCount} comics have no current value tracked \u2014 consider updating`,
        color: 'text-slate-400',
      });
    }

    return result;
  }, [comics]);

  return (
    <div className="bg-surface-primary rounded-xl border border-slate-800 p-5 sm:p-6">
      <h3 className="text-base font-semibold text-white mb-4">Collector Insights</h3>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-3">
            <insight.icon size={16} className={`${insight.color} flex-shrink-0 mt-0.5`} />
            <p className="text-sm text-slate-300 leading-relaxed">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
