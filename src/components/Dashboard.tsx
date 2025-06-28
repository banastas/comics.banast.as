import React from 'react';
import { ComicStats } from '../types/Comic';
import { BookOpen, DollarSign, Award, PenTool, Archive, Star } from 'lucide-react';

interface DashboardProps {
  stats: ComicStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      title: 'Collection Value',
      value: formatCurrency(stats.totalValue),
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
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
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
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

      {stats.highestValuedComic && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white shadow-xl border border-blue-500/30">
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