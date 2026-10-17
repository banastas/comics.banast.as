import React, { useCallback, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, PenTool } from 'lucide-react';
import type { Comic } from '../types/Comic';
import { SEO } from './SEO';
import { generateComicStructuredData } from '../utils/structured-data';
import { formatComicLabel, formatCurrency, formatDateLong, formatValueChange, getValueChange } from '../utils/formatting';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';
import { absoluteUrl, comicPath } from '../utils/paths';
import { hasRealCover } from '../utils/covers';
import { SiteLink } from './SiteLink';
import { CoverImage } from './CoverImage';
import { coverAltText } from '../utils/comic-labels';
import { ComicCard, GradeBadge } from './ComicCard';
import { CoverLightbox } from './CoverLightbox';

interface ComicDetailProps {
  comic: Comic;
  allComics: Comic[];
  onBack: () => void;
  onView: (comic: Comic) => void;
  onViewSeries?: (seriesName: string) => void;
  onViewStorageLocation?: (storageLocation: string) => void;
  onViewCoverArtist?: (coverArtist: string) => void;
  onViewTag?: (tag: string) => void;
  breadcrumbItems?: BreadcrumbItem[];
}

const RELATED_LIMIT = 6;

const byIssue = (a: Comic, b: Comic) =>
  a.issueNumber - b.issueNumber || Number(a.isVariant) - Number(b.isVariant) || a.id.localeCompare(b.id, 'en', { numeric: true });

const Fact: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
    <dd className="mt-0.5 font-medium text-white">{children}</dd>
  </div>
);

const linkClass = 'text-blue-300 underline-offset-2 hover:text-blue-200 hover:underline';

export const ComicDetail: React.FC<ComicDetailProps> = ({
  comic,
  allComics,
  onView,
  breadcrumbItems,
}) => {
  const [showCover, setShowCover] = useState(false);
  const closeCover = useCallback(() => setShowCover(false), []);
  useScrollToTop();

  const seriesComics = useMemo(
    () => allComics.filter(c => c.seriesName === comic.seriesName).sort(byIssue),
    [allComics, comic.seriesName]
  );
  const position = seriesComics.findIndex(c => c.id === comic.id);
  const previous = position > 0 ? seriesComics[position - 1] : undefined;
  const next = position >= 0 && position < seriesComics.length - 1 ? seriesComics[position + 1] : undefined;

  // The nearest issues by number, excluding this record.
  const relatedComics = useMemo(
    () => seriesComics
      .filter(c => c.id !== comic.id)
      .sort((a, b) => Math.abs(a.issueNumber - comic.issueNumber) - Math.abs(b.issueNumber - comic.issueNumber) || byIssue(a, b))
      .slice(0, RELATED_LIMIT)
      .sort(byIssue),
    [seriesComics, comic.id, comic.issueNumber]
  );

  const change = getValueChange(comic.purchasePrice, comic.currentValue);
  const label = formatComicLabel(comic);
  const url = absoluteUrl(comicPath(comic));
  const realCover = hasRealCover(comic.coverImageUrl);
  const signedBy = comic.signedBy.trim();

  return (
    <main id="main-content" className="flex-1">
      <SEO
        title={label}
        description={`${comic.seriesName} Issue #${comic.issueNumber}${comic.coverArtist ? ` - Cover art by ${comic.coverArtist}` : ''}. Grade: ${comic.grade}${comic.isSlabbed ? ' (Slabbed)' : ''}${comic.isVariant ? ' (Variant Cover)' : ''}${signedBy ? ` Signed by ${signedBy}` : ''}`}
        keywords={`${comic.seriesName}, comic book, issue ${comic.issueNumber}, ${comic.coverArtist || 'comic'}, ${comic.isSlabbed ? 'slabbed comic, graded comic,' : ''} ${comic.isVariant ? 'variant cover,' : ''} comic collection`}
        image={realCover ? comic.coverImageUrl : undefined}
        url={url}
        type="article"
        structuredData={generateComicStructuredData({
          id: comic.id,
          title: comic.title,
          seriesName: comic.seriesName,
          issueNumber: comic.issueNumber,
          releaseDate: comic.releaseDate,
          coverImageUrl: comic.coverImageUrl,
          coverArtist: comic.coverArtist,
          currentValue: comic.currentValue,
          grade: comic.grade,
          signedBy: comic.signedBy,
          isVariant: comic.isVariant,
        })}
        canonical={url}
      />

      <div className="border-b border-slate-800 bg-surface-primary/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6 md:min-h-16 lg:px-8">
          {breadcrumbItems && <Breadcrumb items={breadcrumbItems} />}
          {(previous || next) && (
            <nav aria-label="Issues in this series" className="flex gap-2 text-sm">
              {previous ? (
                <SiteLink to={{ type: 'comic', comic: previous }} className="flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-slate-200 hover:border-slate-500" aria-label={`Previous: ${formatComicLabel(previous)}`}>
                  <ChevronLeft size={16} aria-hidden="true" />#{previous.issueNumber}{previous.isVariant ? ' var.' : ''}
                </SiteLink>
              ) : <span />}
              {next && (
                <SiteLink to={{ type: 'comic', comic: next }} className="flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-slate-200 hover:border-slate-500" aria-label={`Next: ${formatComicLabel(next)}`}>
                  #{next.issueNumber}{next.isVariant ? ' var.' : ''}<ChevronRight size={16} aria-hidden="true" />
                </SiteLink>
              )}
            </nav>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <article className="rounded-xl border border-slate-800 bg-surface-primary p-4 sm:p-6">
          <div className="flex flex-col gap-6 md:flex-row md:gap-8">
            <div className="mx-auto w-full max-w-[280px] flex-shrink-0 md:mx-0 md:w-64 lg:w-72">
              {realCover ? (
                <button
                  type="button"
                  onClick={() => setShowCover(true)}
                  className="group relative block aspect-[2/3] w-full overflow-hidden rounded-lg border border-slate-700 bg-surface-secondary shadow-xl"
                  aria-label={`Enlarge cover: ${coverAltText(comic)}`}
                >
                  <CoverImage comic={comic} displayWidth={288} sizes="(max-width: 768px) 280px, 288px" decorative priority />
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/70 p-1.5 text-white opacity-80 transition-opacity group-hover:opacity-100" aria-hidden="true">
                    <Maximize2 size={16} />
                  </span>
                </button>
              ) : (
                <div className="aspect-[2/3] w-full overflow-hidden rounded-lg border border-slate-700">
                  <CoverImage comic={comic} displayWidth={288} />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                <SiteLink to={{ type: 'series', name: comic.seriesName }} className="hover:text-blue-200">{comic.seriesName}</SiteLink>
                {' '}#{comic.issueNumber}
              </h1>
              {comic.title && comic.title !== comic.seriesName && <p className="mt-1 text-lg text-slate-300">{comic.title}</p>}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <GradeBadge comic={comic} size="md" />
                <SiteLink
                  to={{ type: comic.isSlabbed ? 'slabbed' : 'raw' }}
                  className={`rounded-md border px-2.5 py-1 text-sm transition-colors ${comic.isSlabbed ? 'border-purple-500/40 bg-purple-500/15 text-purple-200 hover:bg-purple-500/25' : 'border-slate-600 bg-slate-700/30 text-slate-200 hover:bg-slate-700/60'}`}
                >
                  {comic.isSlabbed ? 'Slabbed' : 'Raw'}
                </SiteLink>
                {comic.isVariant && (
                  <SiteLink to={{ type: 'variants' }} className="rounded-md border border-orange-500/40 bg-orange-500/15 px-2.5 py-1 text-sm text-orange-200 hover:bg-orange-500/25">Variant cover</SiteLink>
                )}
                {comic.isGraphicNovel && <span className="rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-sm text-emerald-200">Graphic novel</span>}
                {signedBy && (
                  <span className="flex items-center gap-1 rounded-md border border-rose-500/40 bg-rose-500/15 px-2.5 py-1 text-sm text-rose-200">
                    <PenTool size={13} aria-hidden="true" />Signed
                  </span>
                )}
              </div>

              <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
                <Fact label="Current value">
                  {comic.currentValue === undefined ? <span className="text-slate-400">Not recorded</span> : (
                    <>
                      <span className="text-lg">{formatCurrency(comic.currentValue)}</span>
                      {change && change.trend !== 'flat' && (
                        <span className={`block text-xs ${change.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>{formatValueChange(change)} since purchase</span>
                      )}
                    </>
                  )}
                </Fact>
                <Fact label="Purchase price">
                  {comic.purchasePrice === undefined ? <span className="text-slate-400">Not recorded</span> : formatCurrency(comic.purchasePrice)}
                </Fact>
                <Fact label="Release date">{formatDateLong(comic.releaseDate)}</Fact>
                <Fact label="Purchased">{formatDateLong(comic.purchaseDate)}</Fact>
                {comic.coverArtist && (
                  <Fact label={comic.isVariant ? 'Variant cover by' : 'Cover by'}>
                    <SiteLink to={{ type: 'artist', name: comic.coverArtist }} className={linkClass}>{comic.coverArtist}</SiteLink>
                  </Fact>
                )}
                {signedBy && <Fact label="Signed by">{signedBy}</Fact>}
                {comic.storageLocation && (
                  <Fact label="Stored in">
                    <SiteLink to={{ type: 'storage', name: comic.storageLocation }} className={linkClass}>{comic.storageLocation}</SiteLink>
                  </Fact>
                )}
              </dl>

              {comic.tags.length > 0 && (
                <div className="mt-6">
                  <h2 className="mb-2 text-xs uppercase tracking-wide text-slate-400">Tags</h2>
                  <ul className="flex flex-wrap gap-2">
                    {comic.tags.map((tag) => (
                      <li key={tag}>
                        <SiteLink to={{ type: 'tag', name: tag }} className="inline-block rounded border border-blue-500/30 bg-blue-500/15 px-3 py-1 text-sm text-blue-200 transition-colors hover:bg-blue-500/25">
                          {tag}
                        </SiteLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {comic.notes && (
                <div className="mt-6">
                  <h2 className="mb-2 text-xs uppercase tracking-wide text-slate-400">Notes</h2>
                  <p className="whitespace-pre-wrap rounded-lg border border-slate-700 bg-surface-secondary/50 p-4 text-sm leading-relaxed text-slate-200">{comic.notes}</p>
                </div>
              )}
            </div>
          </div>
        </article>

        {relatedComics.length > 0 && (
          <section aria-labelledby="related-heading" className="rounded-xl border border-slate-800 bg-surface-primary p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="related-heading" className="text-lg font-semibold text-white">More from {comic.seriesName}</h2>
              <SiteLink to={{ type: 'series', name: comic.seriesName }} className={`text-sm ${linkClass}`}>
                View all {seriesComics.length} in the series
              </SiteLink>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {relatedComics.map((related) => (
                <li key={related.id} className="flex">
                  <ComicCard comic={related} onView={onView} showSeriesName={false} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {showCover && realCover && (
        <CoverLightbox src={comic.coverImageUrl} alt={coverAltText(comic)} onClose={closeCover} />
      )}
    </main>
  );
};
