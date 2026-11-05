import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import type { Comic } from '../types/Comic';
import { getCoverSource, hasRealCover } from '../utils/covers';
import { coverAltText } from '../utils/comic-labels';
import { issueText } from '../utils/comic-slug';

interface CoverImageProps {
  comic: Pick<Comic, 'coverImageUrl' | 'seriesName' | 'issueNumber' | 'isVariant' | 'coverArtist'>;
  /** Largest CSS width the image is shown at; used to choose resized sources. */
  displayWidth: number;
  sizes?: string;
  className?: string;
  /** Decorative when the surrounding link or heading already names the comic. */
  decorative?: boolean;
  priority?: boolean;
  compact?: boolean;
}

export const CoverImage: React.FC<CoverImageProps> = ({
  comic,
  displayWidth,
  sizes,
  className = '',
  decorative = false,
  priority = false,
  compact = false,
}) => {
  // 'resized' → retry with the original file → placeholder.
  const [attempt, setAttempt] = useState<'resized' | 'original' | 'failed'>('resized');
  const failed = attempt === 'failed';

  if (!hasRealCover(comic.coverImageUrl) || failed) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-800 to-slate-900 p-2 text-center ${className}`}
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : `${comic.seriesName} ${issueText(comic)}: cover not available`}
        aria-hidden={decorative || undefined}
      >
        <BookOpen size={compact ? 16 : 28} className="text-slate-500" aria-hidden="true" />
        {!compact && (
          <>
            <span className="line-clamp-3 text-xs font-semibold leading-snug text-slate-300">{comic.seriesName}</span>
            <span className="text-xs text-slate-400">{issueText(comic)}</span>
            <span className="text-[10px] uppercase tracking-wide text-slate-500">Cover coming soon</span>
          </>
        )}
      </div>
    );
  }

  const resized = getCoverSource(comic.coverImageUrl, displayWidth);
  const { src, srcSet } = attempt === 'resized' ? resized : { src: comic.coverImageUrl, srcSet: undefined };

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={decorative ? '' : coverAltText(comic)}
      width={400}
      height={600}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      onError={() => setAttempt(attempt === 'resized' && resized.src !== comic.coverImageUrl ? 'original' : 'failed')}
      className={`h-full w-full object-cover ${className}`}
    />
  );
};
