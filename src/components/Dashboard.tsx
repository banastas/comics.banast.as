import React from 'react';
import { ComicStats } from '../types/Comic';
import { BookOpen, DollarSign, Award, PenTool, Archive, Star, TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardProps {
  stats: ComicStats;
  showDetailed?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, showDetailed = false }) => {
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
    {
      title: 'Purchase Value',
      value: formatCurrency(stats.totalPurchaseValue),
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    ...(stats.comicsWithCurrentValue > 0 ? [{
      title: 'Current Value',
      value: formatCurrency(stats.totalCurrentValue),
      icon: TrendingUp,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    }] : []),
    ...(stats.comicsWithCurrentValue > 0 ? [{
      title: 'Total Gain/Loss',
      value: `${stats.totalGainLoss >= 0 ? '+' : ''}${formatCurrency(stats.totalGainLoss)}`,
      icon: stats.totalGainLoss >= 0 ? TrendingUp : TrendingDown,
      color: stats.totalGainLoss >= 0 ? 'bg-emerald-500' : 'bg-red-500',
      bgColor: stats.totalGainLoss >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
      borderColor: stats.totalGainLoss >= 0 ? 'border-emerald-500/30' : 'border-red-500/30',
    }] : []),
    {
      title: 'Average Grade',
      value: stats.averageGrade.toFixed(1),
      icon: Star,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
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
    {
      title: 'Signed Comics',
      value: stats.signedComics.toLocaleString(),
      icon: PenTool,
      color: 'bg-rose-500',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
    },
  ];

  return (
    <div className={showDetailed ? "space-y-8" : "mb-8"}>
      {/* Performance Overview */}
      {stats.comicsWithCurrentValue > 0 && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Collection Performance</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              stats.totalGainLoss >= 0 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {formatPercentage(stats.totalGainLossPercentage)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Total Invested</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalPurchaseValue)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Current Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalCurrentValue)}</p>
              <p className="text-xs text-gray-400">({stats.comicsWithCurrentValue} of {stats.totalComics} comics valued)</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Net Gain/Loss</p>
              <p className={`text-2xl font-bold ${
                stats.totalGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {stats.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(stats.totalGainLoss)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${showDetailed ? 'lg:grid-cols-4' : 'lg:grid-cols-6'} mb-6`}>
        {statsCards.map((stat) => (
          <div
            key={stat.title}
            className={`bg-gray-800 rounded-lg shadow-lg border ${stat.borderColor} p-4 hover:shadow-xl transition-all duration-200 ${stat.bgColor}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">{stat.title}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-2 rounded-lg shadow-lg`}>
                <stat.icon size={20} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Highlights */}
      {showDetailed && stats.comicsWithCurrentValue > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Biggest Gainer */}
          {stats.biggestGainer && (
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg p-6 text-white shadow-xl border border-emerald-500/30">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <TrendingUp size={20} className="mr-2" />
                Biggest Gainer
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold">
                    {stats.biggestGainer.seriesName} #{stats.biggestGainer.issueNumber}
                  </p>
                  <p className="text-emerald-100 opacity-90">{stats.biggestGainer.title}</p>
                  <p className="text-sm text-emerald-200 mt-1 opacity-80">
                    Grade: {stats.biggestGainer.grade} • {stats.biggestGainer.isSlabbed ? 'Slabbed' : 'Raw'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-200">Purchased: {formatCurrency(stats.biggestGainer.purchasePrice)}</p>
                  <p className="text-xl font-bold">Current: {formatCurrency(stats.biggestGainer.currentValue || 0)}</p>
                  <p className="text-sm font-medium">
                    +{formatCurrency((stats.biggestGainer.currentValue || 0) - stats.biggestGainer.purchasePrice)} 
                    ({formatPercentage(((stats.biggestGainer.currentValue || 0) - stats.biggestGainer.purchasePrice) / stats.biggestGainer.purchasePrice * 100)})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Biggest Loser */}
          {stats.biggestLoser && (stats.biggestLoser.currentValue || 0) < stats.biggestLoser.purchasePrice && (
            <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-lg p-6 text-white shadow-xl border border-red-500/30">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <TrendingDown size={20} className="mr-2" />
                Biggest Decline
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold">
                    {stats.biggestLoser.seriesName} #{stats.biggestLoser.issueNumber}
                  </p>
                  <p className="text-red-100 opacity-90">{stats.biggestLoser.title}</p>
                  <p className="text-sm text-red-200 mt-1 opacity-80">
                    Grade: {stats.biggestLoser.grade} • {stats.biggestLoser.isSlabbed ? 'Slabbed' : 'Raw'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-200">Purchased: {formatCurrency(stats.biggestLoser.purchasePrice)}</p>
                  <p className="text-xl font-bold">Current: {formatCurrency(stats.biggestLoser.currentValue || 0)}</p>
                  <p className="text-sm font-medium">
                    {formatCurrency((stats.biggestLoser.currentValue || 0) - stats.biggestLoser.purchasePrice)} 
                    ({formatPercentage(((stats.biggestLoser.currentValue || 0) - stats.biggestLoser.purchasePrice) / stats.biggestLoser.purchasePrice * 100)})
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {stats.highestValuedComic && (
        <div className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white shadow-xl border border-blue-500/30 ${showDetailed ? 'mt-6' : ''}`}>
          <h3 className="text-lg font-semibold mb-2">Most Valuable Comic</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">
                {stats.highestValuedComic.seriesName} #{stats.highestValuedComic.issueNumber}
              </p>
              <p className="text-blue-100 opacity-90">{stats.highestValuedComic.title}</p>
              <p className="text-sm text-blue-200 mt-1 opacity-80">
                Grade: {stats.highestValuedComic.grade} • {stats.highestValuedComic.isSlabbed ? 'Slabbed' : 'Raw'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatCurrency(stats.highestValuedComic.purchasePrice)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};