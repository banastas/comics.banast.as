import React, { useState, useEffect } from 'react';
import { Comic, ComicStats } from '../types/Comic';
import { Dashboard } from './Dashboard';
import { 
  ArrowLeft, 
  Tag,
  Grid,
  List,
  Star,
  Award,
} from 'lucide-react';

interface TagDetailProps {
  tag: string;
  tagComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  onViewSeries?: (seriesName: string) => void;
  onViewTag?: (tag: string) => void;
}

export const TagDetail: React.FC<TagDetailProps> = ({ 
  tag,
  tagComics,
  onBack, 
  onView,
  onViewSeries,
  onViewTag
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'series' | 'issue' | 'grade' | 'value' | 'date'>('series');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate tag statistics
  const tagComicsWithCurrentValue = tagComics.filter(comic => comic.currentValue !== undefined);
  const totalPurchaseValue = tagComics.reduce((sum, comic) => sum + (comic.purchasePrice || 0), 0);
  const totalCurrentValue = tagComicsWithCurrentValue.reduce((sum, comic) => sum + (comic.currentValue || 0), 0);
  const totalGainLoss = totalCurrentValue - tagComicsWithCurrentValue.reduce((sum, comic) => sum + (comic.purchasePrice || 0), 0);
  
  // Find biggest gainer and loser
  const biggestGainer = tagComicsWithCurrentValue.reduce((biggest, comic) => {
    const gain = (comic.currentValue || 0) - (comic.purchasePrice || 0);
    const biggestGain = biggest ? ((biggest.currentValue || 0) - (biggest.purchasePrice || 0)) : -Infinity;
    return gain > biggestGain ? comic : biggest;
  }, null as Comic | null);

  const biggestLoser = tagComicsWithCurrentValue.reduce((biggest, comic) => {
    const loss = (comic.currentValue || 0) - (comic.purchasePrice || 0);
    const biggestLoss = biggest ? ((biggest.currentValue || 0) - (biggest.purchasePrice || 0)) : Infinity;
    return loss < biggestLoss ? comic : biggest;
  }, null as Comic | null);

  const tagComicsStats: ComicStats = {
    totalComics: tagComics.length,
    totalValue: totalPurchaseValue,
    totalPurchaseValue,
    totalCurrentValue,
    highestValuedComic: tagComics.reduce((highest, comic) => {
      const comicValue = comic.currentValue || comic.purchasePrice || 0;
      const highestValue = highest ? (highest.currentValue || highest.purchasePrice || 0) : 0;
      return comicValue > highestValue ? comic : highest;
    }, null as Comic | null),
    highestValuedSlabbedComic: tagComics
      .filter(comic => comic.isSlabbed)
      .reduce((highest, comic) => {
        const comicValue = comic.currentValue || comic.purchasePrice || 0;
        const highestValue = highest ? (highest.currentValue || highest.purchasePrice || 0) : 0;
        return comicValue > highestValue ? comic : highest;
      }, null as Comic | null),
    highestValuedRawComic: tagComics
      .filter(comic => !comic.isSlabbed)
      .reduce((highest, comic) => {
        const comicValue = comic.currentValue || comic.purchasePrice || 0;
        const highestValue = highest ? (highest.currentValue || highest.purchasePrice || 0) : 0;
        return comicValue > highestValue ? comic : highest;
      }, null as Comic | null),
    biggestGainer,
    biggestLoser,
    rawComics: tagComics.filter(comic => !comic.isSlabbed).length,
    slabbedComics: tagComics.filter(comic => comic.isSlabbed).length,
    signedComics: tagComics.filter(comic => comic.signedBy.trim() !== '').length,
    averageGrade: tagComics.length > 0 ? tagComics.reduce((sum, comic) => sum + comic.grade, 0) / tagComics.length : 0,
    totalGainLoss,
    totalGainLossPercentage: tagComicsWithCurrentValue.length > 0 && tagComicsWithCurrentValue.reduce((sum, comic) => sum + (comic.purchasePrice || 0), 0) > 0
      ? (totalGainLoss / tagComicsWithCurrentValue.reduce((sum, comic) => sum + (comic.purchasePrice || 0), 0)) * 100 
      : 0,
    comicsWithCurrentValue: tagComicsWithCurrentValue.length,
  };

  // Get unique series with this tag
  const uniqueSeries = Array.from(new Set(tagComics.map(comic => comic.seriesName))).sort();

  // Get related tags (tags that appear with this tag)
  const relatedTags = Array.from(new Set(
    tagComics.flatMap(comic => comic.tags.filter(t => t !== tag))
  )).sort();

  // Sort comics
  const sortedComics = [...tagComics].sort((a, b) => {
    switch (sortBy) {
      case 'series': {
        const seriesCompare = a.seriesName.localeCompare(b.seriesName);
        return seriesCompare !== 0 ? seriesCompare : a.issueNumber - b.issueNumber;
      }
      case 'issue': {
        return a.issueNumber - b.issueNumber;
      }
      case 'grade': {
        return b.grade - a.grade;
      }
      case 'value': {
        const aValue = a.currentValue || a.purchasePrice;
        const bValue = b.currentValue || b.purchasePrice;
        return bValue - aValue;
      }
      case 'date': {
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      }
      default: {
        return a.seriesName.localeCompare(b.seriesName);
      }
    }
  });

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
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
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
          {/* Tag Header and Statistics */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Tag size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">#{tag}</h1>
                  <p className="text-gray-300">
                    {tagComics.length} comic{tagComics.length !== 1 ? 's' : ''} with this tag
                    {uniqueSeries.length > 0 && (
                      <span className="text-gray-400 ml-2">
                        • {uniqueSeries.length} series
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <Dashboard 
              stats={tagComicsStats} 
              showDetailed={true}
              onViewComic={onView}
            />


            {/* Series and Related Tags */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Series Breakdown */}
              {uniqueSeries.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Series with #{tag}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {uniqueSeries.slice(0, 8).map(series => {
                      const seriesCount = tagComics.filter(comic => comic.seriesName === series).length;
                      const seriesValue = tagComics
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

              {/* Related Tags */}
              {relatedTags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Related Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedTags.slice(0, 12).map(relatedTag => {
                      const tagCount = tagComics.filter(comic => comic.tags.includes(relatedTag)).length;
                      
                      return (
                        <button
                          key={relatedTag}
                          onClick={() => onViewTag?.(relatedTag)}
                          className="px-3 py-1 bg-gray-700/50 text-gray-300 text-sm rounded border border-gray-600 hover:border-blue-500 hover:text-blue-400 transition-colors"
                        >
                          #{relatedTag} ({tagCount})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comics Grid/List */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Comics tagged with #{tag}</h3>
            
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
                          <div className="flex flex-wrap gap-1 mt-1">
                            {comic.tags.map(comicTag => (
                              <span
                                key={comicTag}
                                className={`px-2 py-0.5 text-xs rounded border cursor-pointer transition-colors ${
                                  comicTag === tag
                                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                    : 'bg-gray-600/20 text-gray-400 border-gray-600/30 hover:border-blue-500/30 hover:text-blue-400'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (comicTag !== tag) {
                                    onViewTag?.(comicTag);
                                  }
                                }}
                              >
                                #{comicTag}
                              </span>
                            ))}
                          </div>
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