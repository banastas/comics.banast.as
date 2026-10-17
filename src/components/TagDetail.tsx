import React, { useMemo } from 'react';
import { Tag } from 'lucide-react';
import type { Comic } from '../types/Comic';
import { DetailPageLayout } from './DetailPageLayout';
import { SEO } from './SEO';
import { SeriesBreakdown } from './SeriesBreakdown';
import type { BreadcrumbItem } from './Breadcrumb';
import { generateCollectionPageStructuredData } from '../utils/structured-data';
import { absoluteUrl, tagPath } from '../utils/paths';
import { SiteLink } from './SiteLink';
import { seriesCountLabel } from './detailText';

interface TagDetailProps {
  tag: string;
  tagComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  onViewTag?: (tag: string) => void;
  breadcrumbItems?: BreadcrumbItem[];
}

export const TagDetail: React.FC<TagDetailProps> = React.memo(({
  tag,
  tagComics,
  onBack,
  onView,
  breadcrumbItems,
}) => {
  const uniqueSeriesCount = useMemo(() => new Set(tagComics.map(comic => comic.seriesName)).size, [tagComics]);

  const relatedTags = useMemo(() => {
    const counts = new Map<string, number>();
    tagComics.forEach(comic => comic.tags.filter(t => t !== tag).forEach(t => counts.set(t, (counts.get(t) || 0) + 1)));
    return Array.from(counts).sort(([a, x], [b, y]) => y - x || a.localeCompare(b)).slice(0, 12);
  }, [tagComics, tag]);

  const url = absoluteUrl(tagPath(tag));
  const title = `${tag} Comics`;

  return (
    <DetailPageLayout
      comics={tagComics}
      onBack={onBack}
      onView={onView}
      breadcrumbItems={breadcrumbItems}
      seo={
        <SEO
          title={title}
          description={`Browse ${tagComics.length} comics tagged ${tag}.`}
          keywords={`${tag}, comic book tag, ${tag} comics, comic collection`}
          url={url}
          canonical={url}
          structuredData={generateCollectionPageStructuredData({ name: title, url, comics: tagComics })}
        />
      }
      icon={<Tag size={24} className="text-white" />}
      iconBgColor="bg-blue-600"
      title={title}
      subtitle={seriesCountLabel(tagComics.length, 'comic', uniqueSeriesCount)}
      comicsListTitle={`Comics tagged ${tag}`}
      afterDashboard={
        <>
          <SeriesBreakdown comics={tagComics} title={`Series tagged ${tag}`} maxItems={8} />
          {relatedTags.length > 0 && (
            <div>
              <h3 className="mb-3 text-base font-semibold text-white">Related tags</h3>
              <ul className="flex flex-wrap gap-2">
                {relatedTags.map(([relatedTag, count]) => (
                  <li key={relatedTag}>
                    <SiteLink
                      to={{ type: 'tag', name: relatedTag }}
                      className="inline-block rounded border border-slate-700 bg-surface-secondary/50 px-3 py-1 text-sm text-slate-200 transition-colors hover:border-blue-400 hover:text-blue-200"
                    >
                      {relatedTag} <span className="text-slate-400">{count}</span>
                    </SiteLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      }
      listExtraInfo={(comic) => comic.tags.length > 0 ? (
        <span className="flex flex-wrap gap-1">
          {comic.tags.map(comicTag => (
            <span
              key={comicTag}
              className={`rounded border px-2 py-0.5 ${comicTag === tag ? 'border-blue-500/30 bg-blue-500/20 text-blue-200' : 'border-slate-700/50 bg-slate-700/20 text-slate-300'}`}
            >
              {comicTag}
            </span>
          ))}
        </span>
      ) : null}
    />
  );
});

TagDetail.displayName = 'TagDetail';
