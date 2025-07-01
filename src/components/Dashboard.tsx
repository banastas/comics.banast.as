import React from 'react';
import { Comic } from '../types/Comic';
import { ComicStats } from '../types/Comic';
import { TouchTarget } from './TouchTarget';
import { FluidTypography } from './FluidTypography';
import { LoadingSkeleton } from './LoadingSkeleton';
import { BookOpen, DollarSign, Award, PenTool, Archive, Star, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardProps {
  stats: ComicStats;
  showDetailed?: boolean;
  onViewComic?: (comic: Comic) => void;
  onViewSeries?: (seriesName: string) => void;
  onViewStorageLocation?: (storageLocation: string) => void;
  onViewRawComics?: () => void;
  onViewSlabbedComics?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  stats, 
  showDetailed = false, 
  onViewComic,
  onViewSeries,
  onViewStorageLocation,
  onViewRawComics,
  onViewSlabbedComics
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  const statsCards = [
    {
      title: 'Total Comics',
      value: stats.totalComics.toLocaleString(),
      icon: BookOpen,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    ...(showDetailed ? [{
      title: 'Purchase Value',
      value: formatCurrency(stats.totalPurchaseValue),
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    }] : []),
    ...(stats.comicsWithCurrentValue > 0 ? [{
      title: 'Current Value',
      value: formatCurrency(stats.totalCurrentValue),
      icon: TrendingUp,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    }] : []),
    ...(showDetailed && stats.comicsWithCurrentValue > 0 ? [{
      title: 'Total Gain/Loss',
      value: `${stats.totalGainLoss >= 0 ? '+' : ''}${formatCurrency(stats.totalGainLoss)}`,
      icon: stats.totalGainLoss >= 0 ? TrendingUp : TrendingDown,
      color: stats.totalGainLoss >= 0 ? 'bg-emerald-500' : 'bg-red-500',
      bgColor: stats.totalGainLoss >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
      borderColor: stats.totalGainLoss >= 0 ? 'border-emerald-500/30' : 'border-red-500/30',
    }] : []),
    ...(showDetailed ? [{
      title: 'Average Grade',
      value: stats.averageGrade.toFixed(1),
      icon: Star,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    }] : []),
    ...(stats.slabbedComics > 0 ? [{
      title: 'Slabbed Comics',
      value: stats.slabbedComics.toLocaleString(),
      icon: Archive,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    }] : []),
    ...(stats.rawComics > 0 ? [{
      title: 'Raw Comics',
      value: stats.rawComics.toLocaleString(),
      icon: Award,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
    }] : []),
    ...(showDetailed && stats.signedComics > 0 ? [{
      title: 'Signed Comics',
      value: stats.signedComics.toLocaleString(),
      icon: PenTool,
      color: 'bg-rose-500',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
    }] : []),
  ];

  return (
    <div className={showDetailed ? "space-y-8" : "mb-8"}>
      <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 ${showDetailed ? 'lg:grid-cols-4 xl:grid-cols-5' : 'lg:grid-cols-4 xl:grid-cols-6'} mb-4 sm:mb-6`}>
        {statsCards.map((stat) => (
          <TouchTarget
            key={stat.title}
            onClick={() => {
              if (stat.title === 'Slabbed Comics') {
                onViewSlabbedComics?.();
              } else if (stat.title === 'Raw Comics') {
                onViewRawComics?.();
              }
            }}
            variant="link"
            className={`bg-gray-800 rounded-lg shadow-lg border ${stat.borderColor} p-3 sm:p-4 hover:shadow-xl transition-all duration-200 ${stat.bgColor} ${
              (stat.title === 'Slabbed Comics' || stat.title === 'Raw Comics') ? 'cursor-pointer' : ''
            } min-h-0`}
            ariaLabel={`View ${stat.title.toLowerCase()}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <FluidTypography
                  variant="label"
                  className="text-gray-400 mb-1 truncate"
                >
                  {stat.title}
                </FluidTypography>
                <FluidTypography
                  variant="h3"
                  className="font-bold text-white truncate text-base sm:text-lg lg:text-xl"
                >
                  {stat.value}
                </FluidTypography>
              </div>
              <div className={`${stat.color} p-1.5 sm:p-2 rounded-lg shadow-lg self-end sm:self-auto mt-2 sm:mt-0 flex-shrink-0`}>
                <stat.icon size={14} className="text-white sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              </div>
            </div>
          </TouchTarget>
        ))}
      </div>

      {/* Performance Highlights */}
      {showDetailed && stats.comicsWithCurrentValue > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Biggest Gainer */}
          {stats.biggestGainer && (
            <TouchTarget
              onClick={() => onViewComic?.(stats.biggestGainer!)}
              variant="link"
              className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg p-4 sm:p-6 text-white shadow-xl border border-emerald-500/30 hover:shadow-2xl transition-all min-h-0"
              ariaLabel={`View biggest gainer: ${stats.biggestGainer.seriesName} #${stats.biggestGainer.issueNumber}`}
            >
              <FluidTypography
                variant="h3"
                className="font-semibold mb-2 sm:mb-3 flex items-center text-base sm:text-lg"
              >
                <TrendingUp size={18} className="mr-2 sm:w-5 sm:h-5" />
                Biggest Gainer
              </FluidTypography>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <FluidTypography
                    variant="h2"
                    className="font-bold text-lg sm:text-xl"
                  >
                    {stats.biggestGainer.seriesName} #{stats.biggestGainer.issueNumber}
                  </FluidTypography>
                  <FluidTypography
                    variant="body"
                    className="text-emerald-100 opacity-90 truncate"
                  >
                    {stats.biggestGainer.title}
                  </FluidTypography>
                  <FluidTypography
                    variant="caption"
                    className="text-emerald-200 mt-1 opacity-80"
                  >
                    Grade: {stats.biggestGainer.grade} • {stats.biggestGainer.isSlabbed ? 'Slabbed' : 'Raw'}
                  </FluidTypography>
                </div>
                <div className="text-left sm:text-right">
                  <FluidTypography
                    variant="caption"
                    className="text-emerald-200"
                  >
                    Purchased: {formatCurrency(stats.biggestGainer.purchasePrice)}
                  </FluidTypography>
                  <FluidTypography
                    variant="h2"
                    className="font-bold text-lg sm:text-xl"
                  >
                    Current: {formatCurrency(stats.biggestGainer.currentValue || 0)}
                  </FluidTypography>
                  <FluidTypography
                    variant="caption"
                    className="font-medium"
                  >
                    +{formatCurrency((stats.biggestGainer.currentValue || 0) - stats.biggestGainer.purchasePrice)} 
                    {stats.biggestGainer.purchasePrice > 0 && ` (${formatPercentage(((stats.biggestGainer.currentValue || 0) - stats.biggestGainer.purchasePrice) / stats.biggestGainer.purchasePrice * 100)})`}
                  </FluidTypography>
                </div>
              </div>
            </TouchTarget>
          )}

          {/* Biggest Loser */}
          {stats.biggestLoser && (stats.biggestLoser.currentValue || 0) < stats.biggestLoser.purchasePrice && (
            <TouchTarget
              onClick={() => onViewComic?.(stats.biggestLoser!)}
              variant="link"
              className="bg-gradient-to-r from-red-600 to-rose-600 rounded-lg p-4 sm:p-6 text-white shadow-xl border border-red-500/30 hover:shadow-2xl transition-all min-h-0"
              ariaLabel={`View biggest decline: ${stats.biggestLoser.seriesName} #${stats.biggestLoser.issueNumber}`}
            >
              <FluidTypography
                variant="h3"
                className="font-semibold mb-2 sm:mb-3 flex items-center text-base sm:text-lg"
              >
                <TrendingDown size={18} className="mr-2 sm:w-5 sm:h-5" />
                Biggest Decline
              </FluidTypography>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <FluidTypography
                    variant="h2"
                    className="font-bold text-lg sm:text-xl"
                  >
                    {stats.biggestLoser.seriesName} #{stats.biggestLoser.issueNumber}
                  </FluidTypography>
                  <FluidTypography
                    variant="body"
                    className="text-red-100 opacity-90 truncate"
                  >
                    {stats.biggestLoser.title}
                  </FluidTypography>
                  <FluidTypography
                    variant="caption"
                    className="text-red-200 mt-1 opacity-80"
                  >
                    Grade: {stats.biggestLoser.grade} • {stats.biggestLoser.isSlabbed ? 'Slabbed' : 'Raw'}
                  </FluidTypography>
                </div>
                <div className="text-left sm:text-right">
                  <FluidTypography
                    variant="caption"
                    className="text-red-200"
                  >
                    Purchased: {formatCurrency(stats.biggestLoser.purchasePrice)}
                  </FluidTypography>
                  <FluidTypography
                    variant="h2"
                    className="font-bold text-lg sm:text-xl"
                  >
                    Current: {formatCurrency(stats.biggestLoser.currentValue || 0)}
                  </FluidTypography>
                  <FluidTypography
                    variant="caption"
                    className="font-medium"
                  >
                    {formatCurrency((stats.biggestLoser.currentValue || 0) - stats.biggestLoser.purchasePrice)} 
                    {stats.biggestLoser.purchasePrice > 0 && ` (${formatPercentage(((stats.biggestLoser.currentValue || 0) - stats.biggestLoser.purchasePrice) / stats.biggestLoser.purchasePrice * 100)})`}
                  </FluidTypography>
                </div>
              </div>
            </TouchTarget>
          )}
        </div>
      )}

      {/* Most Valuable Comics - Split into Slabbed and Raw */}
      {(stats.highestValuedSlabbedComic || stats.highestValuedRawComic) && (
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 ${showDetailed ? 'mt-4 sm:mt-6' : ''}`}>
          {/* Most Valuable Slabbed Comic */}
          {stats.highestValuedSlabbedComic && (
            <TouchTarget
              onClick={() => onViewComic?.(stats.highestValuedSlabbedComic!)}
              variant="link"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-4 sm:p-6 text-white shadow-xl border border-purple-500/30 hover:shadow-2xl transition-all min-h-0"
              ariaLabel={`View most valuable slabbed comic: ${stats.highestValuedSlabbedComic.seriesName} #${stats.highestValuedSlabbedComic.issueNumber}`}
            >
              <FluidTypography
                variant="h3"
                className="font-semibold mb-2 sm:mb-3 flex items-center text-base sm:text-lg"
              >
                <Award size={18} className="mr-2 sm:w-5 sm:h-5" />
                Most Valuable Slabbed
              </FluidTypography>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <FluidTypography
                    variant="h2"
                    className="font-bold text-lg sm:text-xl"
                  >
                    {stats.highestValuedSlabbedComic.seriesName} #{stats.highestValuedSlabbedComic.issueNumber}
                  </FluidTypography>
                  <FluidTypography
                    variant="body"
                    className="text-purple-100 opacity-90 truncate"
                  >
                    {stats.highestValuedSlabbedComic.title}
                  </FluidTypography>
                  <FluidTypography
                    variant="caption"
                    className="text-purple-200 mt-1 opacity-80"
                  >
                    Grade: {stats.highestValuedSlabbedComic.grade}
                  </FluidTypography>
                </div>
                <div className="text-left sm:text-right">
                  <FluidTypography
                    variant="h1"
                    className="font-bold text-xl sm:text-2xl"
                  >
                    {formatCurrency(stats.highestValuedSlabbedComic.currentValue || stats.highestValuedSlabbedComic.purchasePrice)}
                  </FluidTypography>
                </div>
              </div>
            </TouchTarget>
          )}

          {/* Most Valuable Raw Comic */}
          {stats.highestValuedRawComic && (
            <TouchTarget
              onClick={() => onViewComic?.(stats.highestValuedRawComic!)}
              variant="link"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-4 sm:p-6 text-white shadow-xl border border-blue-500/30 hover:shadow-2xl transition-all min-h-0"
              ariaLabel={`View most valuable raw comic: ${stats.highestValuedRawComic.seriesName} #${stats.highestValuedRawComic.issueNumber}`}
            >
              <FluidTypography
                variant="h3"
                className="font-semibold mb-2 sm:mb-3 flex items-center text-base sm:text-lg"
              >
                <BookOpen size={18} className="mr-2 sm:w-5 sm:h-5" />
                Most Valuable Raw
              </FluidTypography>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <FluidTypography
                    variant="h2"
                    className="font-bold text-lg sm:text-xl"
                  >
                    {stats.highestValuedRawComic.seriesName} #{stats.highestValuedRawComic.issueNumber}
                  </FluidTypography>
                  <FluidTypography
                    variant="body"
                    className="text-blue-100 opacity-90 truncate"
                  >
                    {stats.highestValuedRawComic.title}
                  </FluidTypography>
                  <FluidTypography
                    variant="caption"
                    className="text-blue-200 mt-1 opacity-80"
                  >
                    Grade: {stats.highestValuedRawComic.grade}
                  </FluidTypography>
                </div>
                <div className="text-left sm:text-right">
                  <FluidTypography
                    variant="h1"
                    className="font-bold text-xl sm:text-2xl"
                  >
                    {formatCurrency(stats.highestValuedRawComic.currentValue || stats.highestValuedRawComic.purchasePrice)}
                  </FluidTypography>
                </div>
              </div>
            </TouchTarget>
          )}
        </div>
      )}
    </div>
  );
};