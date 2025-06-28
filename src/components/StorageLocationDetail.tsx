import React, { useState } from 'react';
import { Comic } from '../types/Comic';
import { 
  ArrowLeft, 
  Calendar, 
  Star, 
  DollarSign, 
  Award, 
  PenTool, 
  MapPin,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Grid,
  List,
  Edit,
  Package
} from 'lucide-react';

interface StorageLocationDetailProps {
  storageLocation: string;
  locationComics: Comic[];
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

export const StorageLocationDetail: React.FC<StorageLocationDetailProps> = ({ 
  storageLocation,
  locationComics,
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
  const [sortBy, setSortBy] = useState<'series' | 'issue' | 'grade' | 'value' | 'date'>('series');

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

  // Calculate storage location statistics
  const totalComics = locationComics.length;
  const totalValue = locationComics.reduce((sum, comic) => sum + comic.purchasePrice, 0);
  const currentValue = locationComics.reduce((sum, comic) => sum + (comic.currentValue || comic.purchasePrice), 0);
  const gainLoss = currentValue - totalValue;
  const gainLossPercentage = totalValue > 0 ? (gainLoss / totalValue) * 100 : 0;
  const averageGrade = totalComics > 0 ? locationComics.reduce((sum, comic) => sum + comic.grade, 0) / totalComics : 0;
  const slabbedCount = locationComics.filter(comic => comic.isSlabbed).length;
  const signedCount = locationComics.filter(comic => comic.signedBy.trim() !== '').length;

  // Get unique series in this location
  const uniqueSeries = Array.from(new Set(locationComics.map(comic => comic.seriesName))).sort();

  // Find most valuable comic
  const mostValuable = locationComics.reduce((highest, comic) => {
    const comicValue = comic.currentValue || comic.purchasePrice;
    const highestValue = highest ? (highest.currentValue || highest.purchasePrice) : 0;
    return comicValue > highestValue ? comic : highest;
  }, null as Comic | null);

  // Sort comics
  const sortedComics = [...locationComics].sort((a, b) => {
    switch (sortBy) {
      case 'series':
        const seriesCompare = a.seriesName.localeCompare(b.seriesName);
        return seriesCompare !== 0 ? seriesCompare : a.issueNumber - b.issueNumber;
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
        return a.seriesName.localeCompare(b.seriesName);
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
                <option value="series">Sort by Series</option>
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
          {/* Storage Location Header */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-500 rounded-lg">
                  <MapPin size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{storageLocation}</h1>
                  <p className="text-gray-300">
                    {totalComics} comic{totalComics !== 1 ? 's' : ''} stored here
                    {uniqueSeries.length > 0 && (
                      <span className="text-gray-400 ml-2">
                        • {uniqueSeries.length} series
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{formatCurrency(currentValue)}</p>
                <p className="text-sm text-gray-400">Current Value</p>
              </div>
            </div>

            {/* Storage Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Comics</p>
                    <p className="text-xl font-bold text-white">{totalComics}</p>
                  </div>
                  <Package size={20} className="text-blue-400" />
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
                      ({gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(1)}%)
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
                      {totalComics > 0 ? Math.round((slabbedCount / totalComics) * 100) : 0}%
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
                      {totalComics > 0 ? Math.round((signedCount / totalComics) * 100) : 0}%
                    </p>
                  </div>
                  <PenTool size={20} className="text-rose-400" />
                </div>
              </div>
            </div>

            {/* Most Valuable Comic */}
            {mostValuable && (
              <div className="mt-6 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-4 text-white">
                <h3 className="text-lg font-semibold mb-2">Most Valuable Comic</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold">
                      {mostValuable.seriesName} #{mostValuable.issueNumber}
                    </p>
                    <p className="text-orange-100 opacity-90">{mostValuable.title}</p>
                    <p className="text-sm text-orange-200 opacity-80">
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

            {/* Series Breakdown */}
            {uniqueSeries.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Series in this Location</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {uniqueSeries.map(series => {
                    const seriesCount = locationComics.filter(comic => comic.seriesName === series).length;
                    const seriesValue = locationComics
                      .filter(comic => comic.seriesName === series)
                      .reduce((sum, comic) => sum + (comic.currentValue || comic.purchasePrice), 0);
                    
                    return (
                      <div 
                        key={series} 
                        className="bg-gray-700/30 rounded-lg p-3 border border-gray-600 cursor-pointer hover:border-blue-500 transition-colors"
                        onClick={() => onViewSeries?.(series)}
                      >
                        <p className="font-medium text-white text-sm truncate">{series}</p>
                        <p className="text-xs text-gray-400">{seriesCount} issue{seriesCount !== 1 ? 's' : ''}</p>
                        <p className="text-xs text-green-400">{formatCurrency(seriesValue)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Comics Grid/List */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Comics in {storageLocation}</h3>
            
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
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => onEdit(comic)}
                            className="p-1 bg-gray-900/80 text-white rounded hover:bg-gray-900/90 transition-colors backdrop-blur-sm"
                          >
                            <Edit size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <p className="font-medium text-white text-sm truncate mb-1">{comic.seriesName}</p>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-400">#{comic.issueNumber}</p>
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
                            <h4 className="font-bold text-white">{comic.seriesName} #{comic.issueNumber}</h4>
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
                            </p>
                          )}
                        </div>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onEdit(comic)}
                            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            <Edit size={14} />
                          </button>
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