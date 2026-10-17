import React from 'react';
import type { Comic } from '../types/Comic';
import { ComicCard } from './ComicCard';
import { ComicListView } from './ComicListView';

interface ComicGridListProps {
  comics: Comic[];
  viewMode: 'grid' | 'list';
  onView: (comic: Comic) => void;
  listExtraInfo?: (comic: Comic) => React.ReactNode;
  showSeriesName?: boolean;
}

export const ComicGridList: React.FC<ComicGridListProps> = ({
  comics,
  viewMode,
  onView,
  listExtraInfo,
  showSeriesName = true,
}) => {
  if (viewMode === 'grid') {
    return (
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-5 xl:grid-cols-6">
        {comics.map((comic, index) => (
          <li key={comic.id} className="flex">
            <ComicCard comic={comic} onView={onView} showSeriesName={showSeriesName} priority={index < 4} />
          </li>
        ))}
      </ul>
    );
  }

  return <ComicListView comics={comics} onView={onView} extraInfo={listExtraInfo} />;
};
