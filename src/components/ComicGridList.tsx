import React from 'react';
import { Comic } from '../types/Comic';
import { ComicGridCard } from './ComicGridCard';
import { ComicListRow } from './ComicListRow';

interface ComicGridListProps {
  comics: Comic[];
  viewMode: 'grid' | 'list';
  onView: (comic: Comic) => void;
  gridBadges?: (comic: Comic) => React.ReactNode;
  listBadges?: (comic: Comic) => React.ReactNode;
  listExtraInfo?: (comic: Comic) => React.ReactNode;
  showSeriesName?: boolean;
}

export const ComicGridList: React.FC<ComicGridListProps> = ({
  comics,
  viewMode,
  onView,
  gridBadges,
  listBadges,
  listExtraInfo,
  showSeriesName = true,
}) => {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {comics.map(comic => (
          <ComicGridCard
            key={comic.id}
            comic={comic}
            onView={onView}
            badges={gridBadges?.(comic)}
            showSeriesName={showSeriesName}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {comics.map(comic => (
        <ComicListRow
          key={comic.id}
          comic={comic}
          onView={onView}
          badges={listBadges?.(comic)}
          extraInfo={listExtraInfo?.(comic)}
        />
      ))}
    </div>
  );
};
