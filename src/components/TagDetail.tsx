import React, { useState, useMemo } from 'react';
import { Comic } from '../types/Comic';
import { Dashboard } from './Dashboard';
import { DetailPageHeader } from './DetailPageHeader';
import { ComicGridList } from './ComicGridList';
import { Tag } from 'lucide-react';
import { formatCurrency } from '../utils/formatting';
import { calculateComicStats } from '../utils/stats';
import { sortComics, DetailSortField } from '../utils/sorting';
import { useScrollToTop } from '../hooks/useScrollToTop';

interface TagDetailProps {
  tag: string;
  tagComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  onViewSeries?: (seriesName: string) => void;
  onViewTag?: (tag: string) => void;
}

export const TagDetail: React.FC<TagDetailProps> = React.memo(({
  tag,
  tagComics,
  onBack,
  onView,
  onViewSeries,
  onViewTag
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<DetailSortField>('series');

  useScrollToTop();

  const stats = useMemo(() => calculateComicStats(tagComics), [tagComics]);
  const sortedComics = useMemo(() => sortComics(tagComics, sortBy), [tagComics, sortBy]);

  // Get unique series with this tag
  const uniqueSeries = useMemo(
    () => Array.from(new Set(tagComics.map(comic => comic.seriesName))).sort(),
    [tagComics]
  );

  // Get related tags (tags that co-occur with this tag)
  const relatedTags = useMemo(
    () => Array.from(new Set(
      tagComics.flatMap(comic => comic.tags.filter(t => t !== tag))
    )).sort(),
    [tagComics, tag]
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <DetailPageHeader
        onBack={onBack}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortChange={(s) => setSortBy(s as DetailSortField)}
      />

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
              stats={stats}
              showDetailed={true}
              onViewComic={onView}
            />

            {/* Series and Related Tags - side-by-side layout */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Series Breakdown */}
              {uniqueSeries.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Series with #{tag}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {uniqueSeries.slice(0, 8).map(series => {
                      const seriesComics = tagComics.filter(comic => comic.seriesName === series);
                      const seriesCount = seriesComics.length;
                      const seriesValue = seriesComics.reduce(
                        (sum, comic) => sum + (comic.currentValue || comic.purchasePrice || 0), 0
                      );

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

            <ComicGridList
              comics={sortedComics}
              viewMode={viewMode}
              onView={onView}
              listExtraInfo={(comic) => (
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
                        if (comicTag !== tag) onViewTag?.(comicTag);
                      }}
                    >
                      #{comicTag}
                    </span>
                  ))}
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
