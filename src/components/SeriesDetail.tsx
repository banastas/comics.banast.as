import React, { useState } from 'react';
import { Comic } from '../types/Comic';
import { 
  ArrowLeft, 
  Calendar, 
  Star, 
  DollarSign, 
  Award, 
  PenTool, 
  BookOpen,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Grid,
  List,
} from 'lucide-react';

interface SeriesDetailProps {
  seriesName: string;
  seriesComics: Comic[];
  allComics: Comic[];
  onBack: () => void;
  onEdit: (comic: Comic) => void;
  onDelete: (id: string) => void;
  onView: (comic: Comic) => void;
  onViewSeries?: (seriesName: string) => void;
  onViewStorageLocation?: (storageLocation: string) => void;
  onViewCoverArtist?: (coverArtist: string) => void;
  onViewTag?: (tag: string) => void;
}

export const SeriesDetail: React.FC<SeriesDetailProps> = ({ 
  seriesName,
  seriesComics,
  allComics,
  onBack, 
  onEdit, 
  onDelete,
  onView,
  onViewSeries,
  onViewStorageLocation,
  onViewCoverArtist,
  onViewTag
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'issue' | 'grade' | 'value' | 'date'>('issue');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate series statistics
  const totalIssues = seriesComics.length;
  const totalValue = seriesComics.reduce((sum, comic) => sum + comic.purchasePrice, 0);
  const currentValue = seriesComics.reduce((sum, comic) => sum + (comic.currentValue || comic.purchasePrice), 0);
  const gainLoss = currentValue - totalValue;
  const gainLossPercentage = totalValue > 0 ? (gainLoss / totalValue) * 100 : 0;
  const averageGrade = totalIssues > 0 ? seriesComics.reduce((sum, comic) => sum + comic.grade, 0) / totalIssues : 0;
  const slabbedCount = seriesComics.filter(comic => comic.isSlabbed).length;
  const signedCount = seriesComics.filter(comic => comic.signedBy.trim() !== '').length;

  // Find highest and lowest issue numbers
  const issueNumbers = seriesComics.map(comic => comic.issueNumber).sort((a, b) => a - b);
  const lowestIssue = issueNumbers[0];
  const highestIssue = issueNumbers[issueNumbers.length - 1];

  // Find most valuable issue
  const mostValuable = seriesComics.reduce((highest, comic) => {
    const comicValue = comic.currentValue || comic.purchasePrice;
    const highestValue = highest ? (highest.currentValue || highest.purchasePrice) : 0;
    return comicValue > highestValue ? comic : highest;
  }, null as Comic | null);

  // Sort comics
  const sortedComics = [...seriesComics].sort((a, b) => {
    switch (sortBy) {
      case 'issue':
        return a.issueNumber - b.issueNumber;
      case 'grade':
        return b.grade - a.grade;
      case 'value':
        const aValue = a.currentValue || a.purchasePrice;
        const bValue = b.currentValue || b.purchasePrice;
        return bValue - aValue;
      case 'date':
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      default:
        return a.issueNumber - b.issueNumber;
    }
  });

  const handleDelete = (comic: Comic) => {
    if (window.confirm(`Are you sure you want to delete ${comic.seriesName} #${comic.issueNumber}?`)) {
      onDelete(comic.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Collection</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 border border-gray-600 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-l-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-r-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="issue">Sort by Issue #</option>
                <option value="grade">Sort by Grade</option>
                <option value="value">Sort by Value</option>
                <option value="date">Sort by Release Date</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Series Header */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{seriesName}</h1>
                <p className="text-gray-300">
                  {totalIssues} issue{totalIssues !== 1 ? 's' : ''} in collection
                  {lowestIssue && highestIssue && (
                    <span className="text-gray-400 ml-2">
                      (#{lowestIssue} - #{highestIssue})
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{formatCurrency(currentValue)}</p>
                <p className="text-sm text-gray-400">Current Value</p>
              </div>
            </div>

            {/* Series Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Issues</p>
                    <p className="text-xl font-bold text-white">{totalIssues}</p>
                  </div>
                  <BookOpen size={20} className="text-blue-400" />
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Invested</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(totalValue)}</p>
                  </div>
                  <DollarSign size={20} className="text-green-400" />
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Gain/Loss</p>
                    <p className={`text-xl font-bold ${gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                    </p>
                    <p className={`text-xs ${gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {totalValue > 0 && `(${gainLossPercentage >= 0 ? '+' : ''}${gainLossPercentage.toFixed(1)}%)`}
                    </p>
                  </div>
                  {gainLoss >= 0 ? (
                    <TrendingUp size={20} className="text-emerald-400" />
                  ) : (
                    <TrendingDown size={20} className="text-red-400" />
                  )}
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg Grade</p>
                    <p className="text-xl font-bold text-white">{averageGrade.toFixed(1)}</p>
                  </div>
                  <Star size={20} className="text-amber-400" />
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Slabbed</p>
                    <p className="text-xl font-bold text-white">{slabbedCount}</p>
                    <p className="text-xs text-gray-400">
                      {totalIssues > 0 ? Math.round((slabbedCount / totalIssues) * 100) : 0}%
                    </p>
                  </div>
                  <Award size={20} className="text-purple-400" />
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Signed</p>
                    <p className="text-xl font-bold text-white">{signedCount}</p>
                    <p className="text-xs text-gray-400">
                      {totalIssues > 0 ? Math.round((signedCount / totalIssues) * 100) : 0}%
                    </p>
                  </div>
                  <PenTool size={20} className="text-rose-400" />
                </div>
              </div>
            </div>

            {/* Most Valuable Issue */}
            {mostValuable && (
              <div className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white">
                <h3 className="text-lg font-semibold mb-2">Most Valuable Issue</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold">#{mostValuable.issueNumber}</p>
                    <p className="text-blue-100 opacity-90">{mostValuable.title}</p>
                    <p className="text-sm text-blue-200 opacity-80">
                      Grade: {mostValuable.grade} • {mostValuable.isSlabbed ? 'Slabbed' : 'Raw'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {formatCurrency(mostValuable.currentValue || mostValuable.purchasePrice)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Issues Grid/List */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Issues in Collection</h3>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {sortedComics.map((comic) => (
                  <div
                    key={comic.id}
                    className="bg-gray-700/50 rounded-lg border border-gray-600 overflow-hidden hover:border-blue-500 transition-all cursor-pointer group"
                    onClick={() => onView(comic)}
                  >
                    <div className="relative aspect-[2/3] bg-gray-600">
                      {comic.coverImageUrl ? (
                        <img
                          src={comic.coverImageUrl}
                          alt={`${comic.seriesName} #${comic.issueNumber}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Award size={32} className="text-gray-500" />
                        </div>
                      )}
                      
                      {/* Status Badges */}
                      <div className="absolute top-1 left-1 flex flex-col space-y-1">
                        {comic.isSlabbed && (
                          <span className="px-1 py-0.5 bg-purple-500 text-white text-xs font-medium rounded">
                            Slab
                          </span>
                        )}
                        {comic.signedBy && (
                          <span className="px-1 py-0.5 bg-rose-500 text-white text-xs font-medium rounded">
                            Signed
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {/* Action Buttons - Edit button removed */}
                    </div>
                    
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-white">#{comic.issueNumber}</p>
                        <div className="flex items-center space-x-1">
                          <Star size={10} className="text-amber-400" />
                          <span className="text-xs text-white">{comic.grade}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-1">
                        {new Date(comic.releaseDate).getFullYear()}
                      </p>
                      <p className="text-xs font-semibold text-green-400">
                        {formatCurrency(comic.currentValue || comic.purchasePrice)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {sortedComics.map((comic) => (
                  <div
                    key={comic.id}
                    className="bg-gray-700/50 rounded-lg border border-gray-600 p-4 hover:border-blue-500 transition-all cursor-pointer group"
                    onClick={() => onView(comic)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-16 bg-gray-600 rounded overflow-hidden flex-shrink-0">
                          {comic.coverImageUrl ? (
                            <img
                              src={comic.coverImageUrl}
                              alt={`${comic.seriesName} #${comic.issueNumber}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Award size={16} className="text-gray-500" />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-3">
                            <h4 className="font-bold text-white">#{comic.issueNumber}</h4>
                            <div className="flex items-center space-x-1">
                              <Star size={12} className="text-amber-400" />
                              <span className="text-sm text-white">{comic.grade}</span>
                            </div>
                            {comic.isSlabbed && (
                              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30">
                                Slabbed
                              </span>
                            )}
                            {comic.signedBy && (
                              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-xs rounded border border-rose-500/30">
                                Signed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-300">{comic.title}</p>
                          <p className="text-xs text-gray-400">
                            {formatDate(comic.releaseDate)}
                            {comic.coverArtist && ` • ${comic.coverArtist}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {formatCurrency(comic.currentValue || comic.purchasePrice)}
                          </p>
                          {comic.currentValue && comic.currentValue !== comic.purchasePrice && (
                            <p className={`text-xs ${
                              comic.currentValue > comic.purchasePrice ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {comic.currentValue > comic.purchasePrice ? '+' : ''}
                              {formatCurrency(comic.currentValue - comic.purchasePrice)}
                              {comic.purchasePrice > 0 && ` (${((comic.currentValue - comic.purchasePrice) / comic.purchasePrice * 100).toFixed(1)}%)`}
                            </p>
                          )}
                        </div>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          {/* Edit button removed */}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};