import React, { useState, useEffect } from 'react';
import { Comic, ComicStats } from '../types/Comic';
import { Dashboard } from './Dashboard';
import { SEO, generateSeriesStructuredData } from './SEO';
import {
  ArrowLeft,
  Grid,
  List,
  Star,
  Award,
} from 'lucide-react';

interface SeriesDetailProps {
  seriesName: string;
  seriesComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
}

export const SeriesDetail: React.FC<SeriesDetailProps> = ({ 
  seriesName,
  seriesComics,
  onBack, 
  onView,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'issue' | 'grade' | 'value' | 'date'>('issue');

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate series statistics
  const seriesComicsWithCurrentValue = seriesComics.filter(comic => comic.currentValue !== undefined);
  const totalPurchaseValue = seriesComics.reduce((sum, comic) => sum + (comic.purchasePrice || 0), 0);
  const totalCurrentValue = seriesComicsWithCurrentValue.reduce((sum, comic) => sum + (comic.currentValue || 0), 0);
  const totalGainLoss = totalCurrentValue - seriesComicsWithCurrentValue.reduce((sum, comic) => sum + (comic.purchasePrice || 0), 0);
  
  // Find biggest gainer and loser
  const biggestGainer = seriesComicsWithCurrentValue.reduce((biggest, comic) => {
    const gain = (comic.currentValue || 0) - (comic.purchasePrice || 0);
    const biggestGain = biggest ? ((biggest.currentValue || 0) - (biggest.purchasePrice || 0)) : -Infinity;
    return gain > biggestGain ? comic : biggest;
  }, null as Comic | null);

  const biggestLoser = seriesComicsWithCurrentValue.reduce((biggest, comic) => {
    const loss = (comic.currentValue || 0) - (comic.purchasePrice || 0);
    const biggestLoss = biggest ? ((biggest.currentValue || 0) - (biggest.purchasePrice || 0)) : Infinity;
    return loss < biggestLoss ? comic : biggest;
  }, null as Comic | null);

  const seriesComicsStats: ComicStats = {
    totalComics: seriesComics.length,
    totalValue: totalPurchaseValue,
    totalPurchaseValue,
    totalCurrentValue,
    highestValuedComic: seriesComics.reduce((highest, comic) => {
      const comicValue = comic.currentValue || comic.purchasePrice || 0;
      const highestValue = highest ? (highest.currentValue || highest.purchasePrice || 0) : 0;
      return comicValue > highestValue ? comic : highest;
    }, null as Comic | null),
    highestValuedSlabbedComic: seriesComics
      .filter(comic => comic.isSlabbed)
      .reduce((highest, comic) => {
        const comicValue = comic.currentValue || comic.purchasePrice || 0;
        const highestValue = highest ? (highest.currentValue || highest.purchasePrice || 0) : 0;
        return comicValue > highestValue ? comic : highest;
      }, null as Comic | null),
    highestValuedRawComic: seriesComics
      .filter(comic => !comic.isSlabbed)
      .reduce((highest, comic) => {
        const comicValue = comic.currentValue || comic.purchasePrice || 0;
        const highestValue = highest ? (highest.currentValue || highest.purchasePrice || 0) : 0;
        return comicValue > highestValue ? comic : highest;
      }, null as Comic | null),
    biggestGainer,
    biggestLoser,
    rawComics: seriesComics.filter(comic => !comic.isSlabbed).length,
    slabbedComics: seriesComics.filter(comic => comic.isSlabbed).length,
    signedComics: seriesComics.filter(comic => comic.signedBy.trim() !== '').length,
    averageGrade: seriesComics.length > 0 ? seriesComics.reduce((sum, comic) => sum + comic.grade, 0) / seriesComics.length : 0,
    totalGainLoss,
    totalGainLossPercentage: seriesComicsWithCurrentValue.length > 0 && seriesComicsWithCurrentValue.reduce((sum, comic) => sum + (comic.purchasePrice || 0), 0) > 0
      ? (totalGainLoss / seriesComicsWithCurrentValue.reduce((sum, comic) => sum + (comic.purchasePrice || 0), 0)) * 100 
      : 0,
    comicsWithCurrentValue: seriesComicsWithCurrentValue.length,
  };

  // Find highest and lowest issue numbers
  const issueNumbers = seriesComics.map(comic => comic.issueNumber).sort((a, b) => a - b);
  const lowestIssue = issueNumbers[0];
  const highestIssue = issueNumbers[issueNumbers.length - 1];

  // Sort comics
  const sortedComics = [...seriesComics].sort((a, b) => {
    switch (sortBy) {
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
        return a.issueNumber - b.issueNumber;
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-900">
      {/* SEO Meta Tags */}
      <SEO
        title={`${seriesName} Series`}
        description={`Browse ${seriesComics.length} comics from the ${seriesName} series. Total value: $${totalCurrentValue.toFixed(0)}. Issues ${lowestIssue}-${highestIssue}.`}
        keywords={`${seriesName}, comic book series, comic collection, ${seriesName} comics`}
        url={`https://comics.banast.as/#/series/${encodeURIComponent(seriesName)}`}
        structuredData={generateSeriesStructuredData({
          name: seriesName,
          comics: seriesComics,
          totalValue: totalCurrentValue,
        })}
        canonical={`https://comics.banast.as/#/series/${encodeURIComponent(seriesName)}`}
      />

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
          {/* Series Header and Statistics */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{seriesName}</h1>
                <p className="text-gray-300">
                  {seriesComics.length} issue{seriesComics.length !== 1 ? 's' : ''} in collection
                  {lowestIssue && highestIssue && (
                    <span className="text-gray-400 ml-2">
                      (#{lowestIssue} - #{highestIssue})
                    </span>
                  )}
                </p>
              </div>
            </div>

            <Dashboard 
              stats={seriesComicsStats} 
              showDetailed={true}
              onViewComic={onView}
            />

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
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            {formatCurrency(comic.currentValue || comic.purchasePrice)}
                          </p>
                          {comic.currentValue && comic.currentValue !== (comic.purchasePrice || 0) && (
                            <p className={`text-xs ${
                              comic.currentValue > (comic.purchasePrice || 0) ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {comic.currentValue > (comic.purchasePrice || 0) ? '+' : ''}
                              {formatCurrency(comic.currentValue - (comic.purchasePrice || 0))}
                              {(comic.purchasePrice || 0) > 0 && ` (${((comic.currentValue - (comic.purchasePrice || 0)) / (comic.purchasePrice || 0) * 100).toFixed(1)}%)`}
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