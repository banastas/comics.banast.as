import React, { useMemo, useState } from 'react';
import { Archive, MapPin } from 'lucide-react';
import type { Comic } from '../types/Comic';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';
import { SEO } from './SEO';
import { formatCurrency, formatWholeCurrency } from '../utils/formatting';
import { generateCollectionPageStructuredData } from '../utils/structured-data';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { SiteLink } from './SiteLink';

interface StorageLocationsListingProps {
  allComics: Comic[];
  onBack: () => void;
  onViewStorageLocation: (storageLocation: string) => void;
  breadcrumbItems?: BreadcrumbItem[];
}

type BoxSort = 'name' | 'totalValue' | 'avgValue' | 'grade' | 'count';

export const StorageLocationsListing: React.FC<StorageLocationsListingProps> = ({ allComics, breadcrumbItems }) => {
  const [sortBy, setSortBy] = useState<BoxSort>('name');
  useScrollToTop();

  const storageLocations = useMemo(() => {
    const byBox = new Map<string, Comic[]>();
    allComics.forEach((comic) => {
      if (!comic.storageLocation) return;
      byBox.set(comic.storageLocation, [...(byBox.get(comic.storageLocation) ?? []), comic]);
    });
    return Array.from(byBox, ([name, comics]) => {
      const valued = comics.filter((comic) => comic.currentValue !== undefined);
      const totalValue = valued.reduce((sum, comic) => sum + (comic.currentValue ?? 0), 0);
      return {
        name,
        count: comics.length,
        totalValue,
        averageValue: valued.length > 0 ? totalValue / valued.length : 0,
        slabbedCount: comics.filter((comic) => comic.isSlabbed).length,
        rawCount: comics.filter((comic) => !comic.isSlabbed).length,
        averageGrade: comics.reduce((sum, comic) => sum + comic.grade, 0) / comics.length,
      };
    }).sort((a, b) => {
      switch (sortBy) {
        case 'totalValue': return b.totalValue - a.totalValue;
        case 'avgValue': return b.averageValue - a.averageValue;
        case 'grade': return b.averageGrade - a.averageGrade;
        case 'count': return b.count - a.count;
        default: return a.name.localeCompare(b.name, 'en', { numeric: true });
      }
    });
  }, [allComics, sortBy]);

  const boxedComics = storageLocations.reduce((sum, loc) => sum + loc.count, 0);
  const totalValue = storageLocations.reduce((sum, loc) => sum + loc.totalValue, 0);
  const averageGrade = boxedComics > 0
    ? storageLocations.reduce((sum, loc) => sum + loc.averageGrade * loc.count, 0) / boxedComics
    : 0;

  return (
    <main id="main-content" className="flex-1">
      <SEO
        title="Virtual Boxes"
        description={`Browse ${storageLocations.length} virtual boxes in the collection.`}
        keywords="virtual boxes, comic storage, comic collection organization"
        url="https://comics.banast.as/boxes"
        canonical="https://comics.banast.as/boxes"
        structuredData={generateCollectionPageStructuredData({
          name: 'Virtual Boxes',
          url: 'https://comics.banast.as/boxes',
          comics: allComics,
        })}
      />

      <div className="border-b border-slate-800 bg-surface-primary/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:px-6 md:min-h-16 md:flex-row md:items-center md:justify-between lg:px-8">
          {breadcrumbItems && <Breadcrumb items={breadcrumbItems} />}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as BoxSort)}
            aria-label="Sort virtual boxes"
            className="min-w-0 rounded-lg border border-slate-700 bg-surface-secondary px-3 py-2 text-sm text-white"
          >
            <option value="name">Sort by Name</option>
            <option value="totalValue">Sort by Total Value</option>
            <option value="avgValue">Sort by Average Value</option>
            <option value="grade">Sort by Average Grade</option>
            <option value="count">Sort by Comic Count</option>
          </select>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <section className="rounded-xl border border-slate-800 bg-surface-primary p-4 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-orange-600 p-3" aria-hidden="true"><MapPin size={24} className="text-white" /></div>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Virtual Boxes</h1>
              <p className="mt-1 text-slate-300">Where each comic is stored, box by box.</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-10">
            {[
              ['Boxes', storageLocations.length.toLocaleString('en-US')],
              ['Comics', boxedComics.toLocaleString('en-US')],
              ['Current value', formatWholeCurrency(totalValue)],
              ['Avg grade', averageGrade.toFixed(1)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
                <dd className="text-lg font-bold tabular-nums text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="boxes-heading" className="rounded-xl border border-slate-800 bg-surface-primary p-3 sm:p-6">
          <h2 id="boxes-heading" className="mb-4 text-lg font-semibold text-white">All boxes</h2>
          {storageLocations.length > 0 ? (
            <ul className="space-y-3">
              {storageLocations.map((location) => (
                <li key={location.name}>
                  <SiteLink
                    to={{ type: 'storage', name: location.name }}
                    className="group flex flex-col gap-3 rounded-lg border border-slate-700 bg-surface-secondary/40 p-4 transition-colors hover:border-orange-400 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                      <span className="rounded-lg border border-orange-500/30 bg-orange-500/15 p-3" aria-hidden="true">
                        <MapPin size={20} className="text-orange-300" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-lg font-bold text-white transition-colors group-hover:text-orange-200">{location.name}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
                          <span>{location.count} comics</span>
                          <span>Avg grade {location.averageGrade.toFixed(1)}</span>
                          {location.slabbedCount > 0 && (
                            <span className="flex items-center gap-1"><Archive size={12} className="text-purple-300" aria-hidden="true" />{location.slabbedCount} slabbed</span>
                          )}
                          {location.rawCount > 0 && <span>{location.rawCount} raw</span>}
                        </span>
                      </span>
                    </span>
                    <span className="flex-shrink-0 text-left sm:text-right">
                      <span className="block text-xl font-bold tabular-nums text-white">{formatCurrency(location.totalValue)}</span>
                      <span className="block text-sm text-slate-400">{formatCurrency(location.averageValue)} avg</span>
                    </span>
                  </SiteLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-slate-400">No comics have a storage box recorded yet.</p>
          )}
        </section>
      </div>
    </main>
  );
};
