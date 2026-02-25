# comics.banast.as

[![Live Site](https://img.shields.io/badge/Live-comics.banast.as-00d9ff?style=for-the-badge)](https://comics.banast.as)
[![Built with React](https://img.shields.io/badge/Built%20with-React%2018-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)

<img src="https://github.com/banastas/comics.banast.as/blob/main/comic.banast.as.png?raw=true">

A personal comic book collection tracker with financial analytics, multi-view browsing, and comprehensive organization. Currently tracking **777 comics** across **176 series**. Built with React 18, TypeScript, and Tailwind CSS.

**Live Site**: [comics.banast.as](https://comics.banast.as)

## What It Does

- Track comics with full metadata: title, series, issue, grade, value, cover artist, storage location, tags, signatures, and more
- Monitor financial performance with purchase vs. current value, gain/loss calculations, and top gainers/losers
- Browse the collection multiple ways: grid view, list view, by series, by artist, by tag, by storage location, or by condition (raw/slabbed/variant)
- Search across titles, series, artists, notes, and signatures with sorting by any field
- View analytics on a dashboard with collection stats, value breakdowns, and highlighted comics

## Tech Stack

- **React 18** + **TypeScript 5.5** + **Vite 7**
- **Tailwind CSS 3.4** for styling
- **Zustand 5** for state management
- **Zod 4** for data validation
- **Lucide React** for icons
- **react-helmet-async** for dynamic SEO meta tags

## Quick Start

```bash
git clone https://github.com/banastas/comics.banast.as.git
cd comics.banast.as
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Project Structure

```
src/
├── components/           # React components (29 files)
│   ├── Dashboard.tsx     # Analytics dashboard with stats cards
│   ├── ComicCard.tsx     # Grid view card
│   ├── ComicListView.tsx # List view layout
│   ├── ComicDetail.tsx   # Individual comic page
│   ├── ComicForm.tsx     # Add/edit comic form
│   ├── SeriesDetail.tsx  # Series drill-down view
│   ├── CoverArtistDetail.tsx
│   ├── TagDetail.tsx
│   ├── StorageLocationDetail.tsx
│   ├── StorageLocationsListing.tsx
│   ├── RawComicsDetail.tsx
│   ├── SlabbedComicsDetail.tsx
│   ├── VariantsDetail.tsx
│   ├── FilterControls.tsx
│   ├── SEO.tsx           # Dynamic meta tags + structured data
│   ├── ResponsiveImage.tsx
│   ├── ErrorBoundary.tsx
│   └── lazyComponents.ts # Lazy loading config
├── stores/
│   └── comicStore.ts     # Zustand state store
├── hooks/                # React hooks (filtering, routing, scroll)
├── types/
│   └── Comic.ts          # TypeScript interfaces
├── utils/                # Formatting, stats, routing, performance
├── validation/
│   └── comicSchema.ts    # Zod schemas
├── data/
│   └── comics.json       # Collection data (777 comics)
└── styles/
    └── responsive.css
```

## Features

### Dashboard
Total comics, collection value, average grade, raw vs. slabbed breakdown, variant count, signed comics count, biggest gainer/loser, most valuable slabbed and raw comics. All cards are clickable and navigate to their respective detail views.

### Collection Views
- **Grid view** with cover art, grade badges, and value info
- **List view** for compact browsing
- **Detail pages** for individual comics with related issues from the same series

### Organization
- **By series** (176 series) with per-series stats
- **By cover artist** with artist-specific collection views
- **By tag** for custom grouping
- **By storage location** (7 archive boxes + CGC + Loose)
- **By condition**: raw comics, slabbed/graded comics, variant covers

### Search & Filter
Full-text search across multiple fields. Sort by title, series, issue number, release date, grade, purchase date, purchase price, or current value. Ascending/descending toggle.

### Data Management
- JSON-based storage (`src/data/comics.json`)
- Built-in CSV to JSON converter for bulk imports
- Zod schema validation for data integrity
- Automatic timestamps on creation and updates

### SEO
- Dynamic meta tags with react-helmet-async
- Schema.org structured data (ComicIssue, ComicSeries, Collection, Breadcrumb)
- Auto-generated sitemap (~1,134 URLs)
- Open Graph and Twitter Card support
- Hash-based SEO-friendly slugs (e.g., `#/comic/batman-issue-1-variant`)

### Performance
- Lazy-loaded detail views with code splitting
- Manual Vite chunks (react-vendor, icons, data, utils, components)
- Terser minification with console/debugger stripping
- Native lazy loading and async decoding for images
- Skeleton loading states

### Responsive Design
Mobile-first layout from 320px to 4K. 44px minimum touch targets. Fluid typography. Works on desktop, tablet, and phone.

## Scripts

```bash
npm run dev              # Start dev server
npm run build            # Generate sitemap + production build
npm run preview          # Preview production build
npm run lint             # ESLint
npm run generate:sitemap # Regenerate sitemap only
```

## Adding Comics

### CSV Import
1. Click the file upload icon in the header
2. Upload a CSV with columns: title, seriesName, issueNumber, releaseDate, coverImageUrl, coverArtist, grade, purchasePrice, purchaseDate, currentValue, notes, signedBy, storageLocation, tags, isSlabbed, isVariant, isGraphicNovel
3. Download the converted JSON
4. Replace `src/data/comics.json` and restart the dev server

### Manual Edit
Add entries directly to `src/data/comics.json` following the Comic interface in `src/types/Comic.ts`.

## Deployment

```bash
npm run build
```

Deploy the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.). No server or environment variables required.

## Limitations

- JSON file storage (no database)
- Single-user (no authentication)
- Cover images hosted externally (covers.banast.as)
- Hash-based routing (SPA limitations for crawlers)
- No automated backup or sync

## License

MIT
