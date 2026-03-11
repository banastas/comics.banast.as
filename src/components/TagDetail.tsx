import React, { useMemo } from 'react';
import { Comic } from '../types/Comic';
import { DetailPageLayout } from './DetailPageLayout';
import { Tag } from 'lucide-react';
import { formatCurrency } from '../utils/formatting';
import { BreadcrumbItem } from './Breadcrumb';

interface TagDetailProps {
  tag: string;
  tagComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  onViewSeries?: (seriesName: string) => void;
  onViewTag?: (tag: string) => void;
  breadcrumbItems?: BreadcrumbItem[];
}

export const TagDetail: React.FC<TagDetailProps> = React.memo(({
  tag,
  tagComics,
  onBack,
  onView,
  onViewSeries,
  onViewTag,
  breadcrumbItems,
}) => {
  const uniqueSeries = useMemo(
    () => Array.from(new Set(tagComics.map(comic => comic.seriesName))).sort(),
    [tagComics]
  );

  const relatedTags = useMemo(
    () => Array.from(new Set(
      tagComics.flatMap(comic => comic.tags.filter(t => t !== tag))
    )).sort(),
    [tagComics, tag]
  );

  const afterDashboard = (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  className="bg-surface-secondary/30 rounded-lg p-3 border border-slate-700 cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => onViewSeries?.(series)}
                >
                  <p className="font-medium text-white text-sm truncate">{series}</p>
                  <p className="text-xs text-slate-400">{seriesCount} issue{seriesCount !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-green-400">{formatCurrency(seriesValue)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                  className="px-3 py-1 bg-surface-secondary/50 text-slate-300 text-sm rounded border border-slate-700 hover:border-blue-500 hover:text-blue-400 transition-colors"
                >
                  #{relatedTag} ({tagCount})
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DetailPageLayout
      comics={tagComics}
      onBack={onBack}
      onView={onView}
      breadcrumbItems={breadcrumbItems}
      icon={<Tag size={24} className="text-white" />}
      iconBgColor="bg-blue-500"
      title={`#${tag}`}
      subtitle={
        <>
          {tagComics.length} comic{tagComics.length !== 1 ? 's' : ''} with this tag
          {uniqueSeries.length > 0 && (
            <span className="text-slate-400 ml-2">
              &bull; {uniqueSeries.length} series
            </span>
          )}
        </>
      }
      comicsListTitle={`Comics tagged with #${tag}`}
      afterDashboard={afterDashboard}
      listExtraInfo={(comic) => (
        <div className="flex flex-wrap gap-1 mt-1">
          {comic.tags.map(comicTag => (
            <span
              key={comicTag}
              className={`px-2 py-0.5 text-xs rounded border cursor-pointer transition-colors ${
                comicTag === tag
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : 'bg-slate-700/20 text-slate-400 border-slate-700/30 hover:border-blue-500/30 hover:text-blue-400'
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
  );
});
