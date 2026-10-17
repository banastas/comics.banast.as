import React from 'react';
import { formatDateLong } from '../utils/formatting';
import { SiteLink } from './SiteLink';

interface SiteFooterProps {
  /** Most recent sync of the collection data, when known. */
  lastUpdated?: string;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({ lastUpdated }) => (
  <footer className="mt-auto border-t border-slate-800 bg-surface-primary/60">
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <div>
        <p className="font-medium text-slate-200">comics.banast.as</p>
        <p>
          A personal comic book collection.
          {lastUpdated && <> Collection updated {formatDateLong(lastUpdated)}.</>}
        </p>
      </div>
      <nav aria-label="Footer">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li><SiteLink to={{ type: 'stats' }} className="hover:text-white">Statistics</SiteLink></li>
          <li><SiteLink to={{ type: 'boxes' }} className="hover:text-white">Boxes</SiteLink></li>
          <li><a href="/api/comics" className="hover:text-white">JSON API</a></li>
          <li><a href="https://github.com/banastas/comics.banast.as" className="hover:text-white" rel="noopener">Source on GitHub</a></li>
        </ul>
      </nav>
    </div>
  </footer>
);
