import { useState } from 'react';
import { SiteHeader, type HeaderSection } from '../components/SiteHeader';

const noop = () => {};

/** The site header on every page except the collection, whose island owns its own header. */
export default function PageHeader({ section, totalComics }: { section: HeaderSection; totalComics: number }) {
  const [search, setSearch] = useState('');
  return (
    <SiteHeader
      section={section}
      totalComics={totalComics}
      searchInput={search}
      onSearchChange={setSearch}
      onClearSearch={() => setSearch('')}
      submitToCollection
      showCollectionControls={false}
      viewMode="grid"
      onViewModeChange={noop}
      sortField="releaseDate"
      onSortFieldChange={noop}
      sortDirection="desc"
      onToggleSortDirection={noop}
      onOpenMobileControls={noop}
    />
  );
}
