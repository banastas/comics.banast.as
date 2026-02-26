import React from 'react';
import { Comic } from '../types/Comic';
import { ComicStats } from '../types/Comic';
import { BookOpen, DollarSign, Award, PenTool, Archive, Star, TrendingUp, TrendingDown, MapPin } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatting';

interface DashboardProps {
  stats: ComicStats;
  showDetailed?: boolean;
  onViewComic?: (comic: Comic) => void;
  onViewRawComics?: () => void;
  onViewSlabbedComics?: () => void;
  onViewVirtualBoxes?: () => void;
  virtualBoxesCount?: number;
  onViewVariants?: () => void;
  variantsCount?: number;
  hideSlabbedCard?: boolean;
  hideRawCard?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = React.memo(({
  stats,
  showDetailed = false,
  onViewComic,
  onViewRawComics,
  onViewSlabbedComics,
  onViewVirtualBoxes,
  virtualBoxesCount = 0,
  onViewVariants,
  variantsCount = 0,
  hideSlabbedCard = false,
  hideRawCard = false
}) => {
  // Portfolio Hero (only on detailed/stats view)
  const renderPortfolioHero = () => {
    if (!showDetailed) return null;

    const gainLoss = stats.totalGainLoss;
    const gainLossPercent = stats.totalGainLossPercentage;
    const isPositive = gainLoss >= 0;

    return (
      <div className="bg-surface-primary rounded-xl border border-slate-800 p-5 sm:p-8 mb-6">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Portfolio Overview</p>

        {/* Primary metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 mb-6">
          <div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tabular-nums tracking-tight">
              {stats.totalCurrentValue > 0
                ? stats.totalCurrentValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
                : formatCurrency(stats.totalPurchaseValue)}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Current Value</p>
          </div>

          {stats.comicsWithCurrentValue > 0 && !isNaN(gainLoss) && (
            <div>
              <p className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tabular-nums tracking-tight ${
                isPositive ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {isPositive ? '+' : ''}{formatCurrency(gainLoss)}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Return{' '}
                <span className={`font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  ({formatPercentage(gainLossPercent)})
                </span>
              </p>
            </div>
          )}

          <div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tabular-nums tracking-tight">
              {stats.totalComics.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Comics</p>
          </div>
        </div>

        {/* Secondary metrics row */}
        <div className="flex flex-wrap gap-x-8 gap-y-2 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Invested</span>
            <span className="text-sm text-slate-300 font-medium tabular-nums">{formatCurrency(stats.totalPurchaseValue)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Avg Grade</span>
            <span className="text-sm text-slate-300 font-medium tabular-nums">{stats.averageGrade.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Raw</span>
            <span className="text-sm text-slate-300 font-medium tabular-nums">{stats.rawComics}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Slabbed</span>
            <span className="text-sm text-slate-300 font-medium tabular-nums">{stats.slabbedComics}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Variants</span>
            <span className="text-sm text-slate-300 font-medium tabular-nums">{variantsCount}</span>
          </div>
        </div>
      </div>
    );
  };

  const statsCards = [
    {
      title: 'Total Comics',
      value: stats.totalComics.toLocaleString(),
      icon: BookOpen,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      show: stats.totalComics > 0,
    },
    ...(stats.comicsWithCurrentValue > 0 ? [{
      title: 'Current Value',
      value: (stats.totalCurrentValue || 0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }),
      icon: TrendingUp,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      show: stats.totalCurrentValue > 0,
    }] : []),
    ...(stats.slabbedComics > 0 && !hideSlabbedCard ? [{
      title: 'Slabbed Comics',
      value: stats.slabbedComics.toLocaleString(),
      icon: Archive,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      show: stats.slabbedComics > 0,
    }] : []),
    ...(stats.rawComics > 0 && !hideRawCard ? [{
      title: 'Raw Comics',
      value: stats.rawComics.toLocaleString(),
      icon: Award,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      show: stats.rawComics > 0,
    }] : []),
    ...(virtualBoxesCount > 0 ? [{
      title: 'Virtual Boxes',
      value: virtualBoxesCount.toLocaleString(),
      icon: MapPin,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      show: virtualBoxesCount > 0,
    }] : []),
    ...(variantsCount > 0 ? [{
      title: 'Variants',
      value: variantsCount.toLocaleString(),
      icon: Award,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      show: variantsCount > 0,
    }] : []),
    ...(showDetailed && stats.signedComics > 0 ? [{
      title: 'Signed Comics',
      value: stats.signedComics.toLocaleString(),
      icon: PenTool,
      color: 'bg-rose-500',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      show: stats.signedComics > 0,
    }] : []),
  ].filter(card => card.show !== false);

  return (
    <div className={showDetailed ? "space-y-6" : "mb-8"}>
      {renderPortfolioHero()}

      {/* Stat cards - shown on collection tab, or as quick-nav on stats tab */}
      {!showDetailed && (
        <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6 mb-4 sm:mb-6`}>
          {statsCards.map((stat) => (
            <div
              key={stat.title}
              className={`bg-surface-primary rounded-xl shadow-card border ${stat.borderColor} p-3 sm:p-4 hover:shadow-card-hover hover:border-slate-600 transition-all duration-200 ${stat.bgColor} ${
                (stat.title === 'Slabbed Comics' || stat.title === 'Raw Comics' || stat.title === 'Virtual Boxes' || stat.title === 'Variants') ? 'cursor-pointer' : ''
              }`}
              onClick={() => {
                if (stat.title === 'Slabbed Comics') onViewSlabbedComics?.();
                else if (stat.title === 'Raw Comics') onViewRawComics?.();
                else if (stat.title === 'Virtual Boxes') onViewVirtualBoxes?.();
                else if (stat.title === 'Variants') onViewVariants?.();
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-400 mb-1 truncate">{stat.title}</p>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-white truncate tabular-nums">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-1.5 sm:p-2 rounded-lg shadow-lg self-end sm:self-auto mt-2 sm:mt-0 flex-shrink-0`}>
                  <stat.icon size={14} className="text-white sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performance Highlights */}
      {showDetailed && (
        stats.comicsWithCurrentValue > 0 ||
        stats.highestValuedSlabbedComic ||
        stats.highestValuedRawComic
      ) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Biggest Gainer */}
          {stats.biggestGainer && (
            <div
              className="bg-gradient-to-br from-emerald-600/90 to-emerald-700/90 rounded-xl p-5 sm:p-6 text-white shadow-card border border-emerald-500/20 cursor-pointer hover:shadow-glow-emerald transition-all"
              onClick={() => onViewComic?.(stats.biggestGainer!)}
            >
              <h3 className="text-sm font-semibold mb-3 flex items-center text-emerald-200 uppercase tracking-wider">
                <TrendingUp size={16} className="mr-2" />
                Biggest Gainer
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <p className="text-lg sm:text-xl font-bold">
                    {stats.biggestGainer.seriesName} #{stats.biggestGainer.issueNumber}
                  </p>
                  <p className="text-emerald-200/70 text-sm truncate">{stats.biggestGainer.title}</p>
                  <p className="text-xs text-emerald-200/50 mt-1">
                    Grade: {stats.biggestGainer.grade} &middot; {stats.biggestGainer.isSlabbed ? 'Slabbed' : 'Raw'}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-emerald-200/60">
                    Paid: {stats.biggestGainer.purchasePrice ? formatCurrency(stats.biggestGainer.purchasePrice) : 'N/A'}
                  </p>
                  <p className="text-xl font-bold tabular-nums">{formatCurrency(stats.biggestGainer.currentValue || 0)}</p>
                  <p className="text-xs font-medium">
                    {stats.biggestGainer.purchasePrice ?
                      `+${formatCurrency((stats.biggestGainer.currentValue || 0) - (stats.biggestGainer.purchasePrice || 0))}
                      ${(stats.biggestGainer.purchasePrice || 0) > 0 ? `(${formatPercentage(((stats.biggestGainer.currentValue || 0) - (stats.biggestGainer.purchasePrice || 0)) / (stats.biggestGainer.purchasePrice || 0) * 100)})` : ''}` :
                      'Gain/Loss: N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Biggest Loser */}
          {stats.biggestLoser && (stats.biggestLoser.currentValue || 0) < (stats.biggestLoser.purchasePrice || 0) && (
            <div
              className="bg-gradient-to-br from-red-600/90 to-red-700/90 rounded-xl p-5 sm:p-6 text-white shadow-card border border-red-500/20 cursor-pointer hover:shadow-card-hover transition-all"
              onClick={() => onViewComic?.(stats.biggestLoser!)}
            >
              <h3 className="text-sm font-semibold mb-3 flex items-center text-red-200 uppercase tracking-wider">
                <TrendingDown size={16} className="mr-2" />
                Biggest Decline
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <p className="text-lg sm:text-xl font-bold">
                    {stats.biggestLoser.seriesName} #{stats.biggestLoser.issueNumber}
                  </p>
                  <p className="text-red-200/70 text-sm truncate">{stats.biggestLoser.title}</p>
                  <p className="text-xs text-red-200/50 mt-1">
                    Grade: {stats.biggestLoser.grade} &middot; {stats.biggestLoser.isSlabbed ? 'Slabbed' : 'Raw'}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-red-200/60">
                    Paid: {stats.biggestLoser.purchasePrice ? formatCurrency(stats.biggestLoser.purchasePrice) : 'N/A'}
                  </p>
                  <p className="text-xl font-bold tabular-nums">{formatCurrency(stats.biggestLoser.currentValue || 0)}</p>
                  <p className="text-xs font-medium">
                    {stats.biggestLoser.purchasePrice ?
                      `${formatCurrency((stats.biggestLoser.currentValue || 0) - (stats.biggestLoser.purchasePrice || 0))}
                      ${(stats.biggestLoser.purchasePrice || 0) > 0 ? `(${formatPercentage(((stats.biggestLoser.currentValue || 0) - (stats.biggestLoser.purchasePrice || 0)) / (stats.biggestLoser.purchasePrice || 0) * 100)})` : ''}` :
                      'Gain/Loss: N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Most Valuable Slabbed Comic */}
          {stats.highestValuedSlabbedComic && (
            <div
              className="bg-gradient-to-br from-purple-600/90 to-indigo-700/90 rounded-xl p-5 sm:p-6 text-white shadow-card border border-purple-500/20 cursor-pointer hover:shadow-card-hover transition-all"
              onClick={() => onViewComic?.(stats.highestValuedSlabbedComic!)}
            >
              <h3 className="text-sm font-semibold mb-3 flex items-center text-purple-200 uppercase tracking-wider">
                <Award size={16} className="mr-2" />
                Most Valuable Slabbed
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <p className="text-lg sm:text-xl font-bold">
                    {stats.highestValuedSlabbedComic.seriesName} #{stats.highestValuedSlabbedComic.issueNumber}
                  </p>
                  <p className="text-purple-200/70 text-sm truncate">{stats.highestValuedSlabbedComic.title}</p>
                  <p className="text-xs text-purple-200/50 mt-1">Grade: {stats.highestValuedSlabbedComic.grade}</p>
                </div>
                <p className="text-2xl font-bold tabular-nums">{formatCurrency(stats.highestValuedSlabbedComic.currentValue || stats.highestValuedSlabbedComic.purchasePrice || 0)}</p>
              </div>
            </div>
          )}

          {/* Most Valuable Raw Comic */}
          {stats.highestValuedRawComic && (
            <div
              className="bg-gradient-to-br from-blue-600/90 to-cyan-700/90 rounded-xl p-5 sm:p-6 text-white shadow-card border border-blue-500/20 cursor-pointer hover:shadow-card-hover transition-all"
              onClick={() => onViewComic?.(stats.highestValuedRawComic!)}
            >
              <h3 className="text-sm font-semibold mb-3 flex items-center text-blue-200 uppercase tracking-wider">
                <BookOpen size={16} className="mr-2" />
                Most Valuable Raw
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <p className="text-lg sm:text-xl font-bold">
                    {stats.highestValuedRawComic.seriesName} #{stats.highestValuedRawComic.issueNumber}
                  </p>
                  <p className="text-blue-200/70 text-sm truncate">{stats.highestValuedRawComic.title}</p>
                  <p className="text-xs text-blue-200/50 mt-1">Grade: {stats.highestValuedRawComic.grade}</p>
                </div>
                <p className="text-2xl font-bold tabular-nums">{formatCurrency(stats.highestValuedRawComic.currentValue || stats.highestValuedRawComic.purchasePrice || 0)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
