import React from 'react';
import { Comic } from '../types/Comic';
import { ComicStats } from '../types/Comic';
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
    {
      title: 'Slabbed Comics',
      value: stats.slabbedComics.toLocaleString(),
      icon: Archive,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Raw Comics',
      value: stats.rawComics.toLocaleString(),
      icon: Award,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
    },
    ...(showDetailed ? [{
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
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${showDetailed ? 'lg:grid-cols-4' : 'lg:grid-cols-4'} mb-6`}>
        <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 ${showDetailed ? 'lg:grid-cols-4 xl:grid-cols-5' : 'lg:grid-cols-4 xl:grid-cols-6'} mb-4 sm:mb-6`}>
          {statsCards.map((stat) => (
            <div
              key={stat.title}
              className={`bg-gray-800 rounded-lg shadow-lg border ${stat.borderColor} p-4 hover:shadow-xl transition-all duration-200 ${stat.bgColor} ${
                (stat.title === 'Slabbed Comics' || stat.title === 'Raw Comics') ? 'cursor-pointer' : ''
              }`}
              onClick={() => {
                if (stat.title === 'Slabbed Comics') {
                  onViewSlabbedComics?.();
                } else if (stat.title === 'Raw Comics') {
                  onViewRawComics?.();
                }
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-1.5 sm:p-2 rounded-lg shadow-lg self-end sm:self-auto mt-2 sm:mt-0`}>
                  <stat.icon size={16} className="text-white sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Highlights */}
      {showDetailed && stats.comicsWithCurrentValue > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Biggest Gainer */}
          {stats.biggestGainer && (
            <div 
              className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg p-4 sm:p-6 text-white shadow-xl border border-emerald-500/30 cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => onViewComic?.(stats.biggestGainer!)}
            >
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center">
                <TrendingUp size={18} className="mr-2 sm:w-5 sm:h-5" />
                Biggest Gainer
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <p className="text-lg sm:text-xl font-bold">
                    {stats.biggestGainer.seriesName} #{stats.biggestGainer.issueNumber}
                  </p>
                  <p className="text-emerald-100 opacity-90 text-sm sm:text-base truncate">{stats.biggestGainer.title}</p>
                  <p className="text-sm text-emerald-200 mt-1 opacity-80">
                    Grade: {stats.biggestGainer.grade} • {stats.biggestGainer.isSlabbed ? 'Slabbed' : 'Raw'}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-emerald-200">Purchased: {formatCurrency(stats.biggestGainer.purchasePrice)}</p>
                  <p className="text-lg sm:text-xl font-bold">Current: {formatCurrency(stats.biggestGainer.currentValue || 0)}</p>
                  <p className="text-xs sm:text-sm font-medium">
                    +{formatCurrency((stats.biggestGainer.currentValue || 0) - stats.biggestGainer.purchasePrice)} 
                    ({formatPercentage(((stats.biggestGainer.currentValue || 0) - stats.biggestGainer.purchasePrice) / stats.biggestGainer.purchasePrice * 100)})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Biggest Loser */}
          {stats.biggestLoser && (stats.biggestLoser.currentValue || 0) < stats.biggestLoser.purchasePrice && (
            <div 
              className="bg-gradient-to-r from-red-600 to-rose-600 rounded-lg p-4 sm:p-6 text-white shadow-xl border border-red-500/30 cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => onViewComic?.(stats.biggestLoser!)}
            >
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center">
                <TrendingDown size={18} className="mr-2 sm:w-5 sm:h-5" />
                Biggest Decline
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <p className="text-lg sm:text-xl font-bold">
                    {stats.biggestLoser.seriesName} #{stats.biggestLoser.issueNumber}
                  </p>
                  <p className="text-red-100 opacity-90 text-sm sm:text-base truncate">{stats.biggestLoser.title}</p>
                  <p className="text-sm text-red-200 mt-1 opacity-80">
                    Grade: {stats.biggestLoser.grade} • {stats.biggestLoser.isSlabbed ? 'Slabbed' : 'Raw'}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-red-200">Purchased: {formatCurrency(stats.biggestLoser.purchasePrice)}</p>
                  <p className="text-lg sm:text-xl font-bold">Current: {formatCurrency(stats.biggestLoser.currentValue || 0)}</p>
                  <p className="text-xs sm:text-sm font-medium">
                    {formatCurrency((stats.biggestLoser.currentValue || 0) - stats.biggestLoser.purchasePrice)} 
                    ({formatPercentage(((stats.biggestLoser.currentValue || 0) - stats.biggestLoser.purchasePrice) / stats.biggestLoser.purchasePrice * 100)})
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Most Valuable Comics - Split into Slabbed and Raw */}
      {(stats.highestValuedSlabbedComic || stats.highestValuedRawComic) && (
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 ${showDetailed ? 'mt-4 sm:mt-6' : ''}`}>
          {/* Most Valuable Slabbed Comic */}
          {stats.highestValuedSlabbedComic && (
            <div 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-4 sm:p-6 text-white shadow-xl border border-purple-500/30 cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => onViewComic?.(stats.highestValuedSlabbedComic!)}
            >
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center">
                <Award size={18} className="mr-2 sm:w-5 sm:h-5" />
                Most Valuable Slabbed
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <p className="text-lg sm:text-xl font-bold">
                    {stats.highestValuedSlabbedComic.seriesName} #{stats.highestValuedSlabbedComic.issueNumber}
                  </p>
                  <p className="text-purple-100 opacity-90 text-sm sm:text-base truncate">{stats.highestValuedSlabbedComic.title}</p>
                  <p className="text-sm text-purple-200 mt-1 opacity-80">
                    Grade: {stats.highestValuedSlabbedComic.grade}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.highestValuedSlabbedComic.currentValue || stats.highestValuedSlabbedComic.purchasePrice)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Most Valuable Raw Comic */}
          {stats.highestValuedRawComic && (
            <div 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-4 sm:p-6 text-white shadow-xl border border-blue-500/30 cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => onViewComic?.(stats.highestValuedRawComic!)}
            >
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center">
                <BookOpen size={18} className="mr-2 sm:w-5 sm:h-5" />
                Most Valuable Raw
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <p className="text-lg sm:text-xl font-bold">
                    {stats.highestValuedRawComic.seriesName} #{stats.highestValuedRawComic.issueNumber}
                  </p>
                  <p className="text-blue-100 opacity-90 text-sm sm:text-base truncate">{stats.highestValuedRawComic.title}</p>
                  <p className="text-sm text-blue-200 mt-1 opacity-80">
                    Grade: {stats.highestValuedRawComic.grade}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.highestValuedRawComic.currentValue || stats.highestValuedRawComic.purchasePrice)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};