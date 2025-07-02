# Comic Book Collection Manager

A modern, responsive web application for managing and tracking your comic book collection. Built with React, TypeScript, and Tailwind CSS.

---

## Features

### 🗂️ Collection Management
- **Comprehensive Comic Details**: Track title, series, issue number, release date, grade, purchase price, current value, cover artist, storage location, tags, notes, and more.
- **Cover Art Display**: Visual representation of your collection with cover image support.
- **Condition Tracking**: Distinguish between raw and slabbed comics.
- **Signature Tracking**: Record signed comics and who signed them.
- **Storage Location Management**: Organize comics by virtual boxes/storage locations.
- **Tagging System**: Organize comics with custom tags.
- **Variant & Graphic Novel Support**: Track variant covers and graphic novels separately.

### 📊 Advanced Analytics & Statistics
- **Dashboard Overview**: See total comics, value, average grade, and more at a glance.
- **Performance Tracking**: Biggest gainers/losers, total gain/loss, and value trends.
- **Condition Breakdown**: Raw vs slabbed comic statistics.
- **Series, Tag, Artist, and Storage Analytics**: Drill down into your collection by series, tag, cover artist, or storage location.
- **Variant Analytics**: Dedicated variant comics detail page and statistics.

### 🔍 Browsing & Navigation
- **Search**: Quickly find comics by title, series, notes, and more.
- **Grid/List Views**: Switch between grid and list layouts for browsing.
- **Sorting**: Sort by title, series, issue, grade, value, date, and more.
- **Detail Pages**: Click any comic, series, tag, artist, storage location, or variant to view detailed breakdowns.
- **Clickable Info Cards**: All dashboard/statistics cards (Raw, Slabbed, Variants, Virtual Boxes) are clickable and navigate to their respective detail pages.
- **Series Navigation**: Series boxes in all detail pages are clickable and navigate to the series detail view.
- **Responsive Design**: Fully mobile, tablet, and desktop friendly.

### 🏷️ Tag, Artist, and Storage Location Views
- **Tag Detail Pages**: Browse all comics with a specific tag.
- **Cover Artist Pages**: Browse all comics by a specific cover artist.
- **Storage Location Pages**: See all comics in a specific virtual box/storage location.
- **Storage Locations Listing**: View all storage locations with summary stats and click through to detail.

### 🏆 Variants & Special Views
- **Variants Detail Page**: Dedicated page for all variant comics, with clickable info cards and series navigation.
- **Raw/Slabbed Detail Pages**: Dedicated pages for raw and slabbed comics, with series navigation and statistics.

---

## Data Management

### Comic Data Structure

Each comic in the collection has the following properties:

```typescript
interface Comic {
  id: string;
  title: string;
  seriesName: string;
  issueNumber: number;
  releaseDate: string;
  coverImageUrl: string;
  coverArtist: string;
  grade: number;
  purchasePrice: number;
  purchaseDate: string;
  currentValue?: number;
  notes: string;
  signedBy: string;
  storageLocation: string;
  tags: string[];
  isSlabbed: boolean;
  isVariant?: boolean;
  isGraphicNovel?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Adding & Editing Comics

- **Currently, comics are managed by editing `src/data/comics.json` directly.**
- Add a new comic object to the array with all required fields.
- Ensure the `id` is unique and dates are in ISO format (`YYYY-MM-DD`).
- Save the file—changes are reflected immediately.

---

## Using the Application

### Browsing Your Collection
- Use the search bar to find comics.
- Switch between grid and list views.
- Sort comics by various criteria.
- Click any comic for a detailed view.

### Viewing Statistics
- Go to the Statistics tab for analytics.
- Click any info card (Raw, Slabbed, Variants, Virtual Boxes) to navigate to detail pages.
- Explore series, tag, artist, and storage breakdowns.

### Navigation Between Views
- Click on series, tags, cover artists, or storage locations to drill down.
- Use badges and info cards for quick navigation to raw, slabbed, or variant comics.

---

## Customization & Extensibility

- **Add new comic properties**: Update the `Comic` interface and relevant components.
- **Add new statistics**: Update calculation logic and display in the dashboard.
- **Styling**: Tailwind CSS makes it easy to customize colors, layout, and typography.
- **Data**: Easily swap out JSON for a database backend if needed.

---

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React hooks
- **Data Storage**: JSON file (replaceable with a database)

---

## Development

### Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start development server**:
   ```bash
   npm run dev
   ```
3. **Build for production**:
   ```bash
   npm run build
   ```
4. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## Known Issues & Limitations

- **No database**: Data is stored in a JSON file.
- **No user authentication**: Single-user only.
- **No image upload**: Cover images must be hosted externally.
- **No backup/import/export**: Manual data management.
- **Add/Edit UI**: Comic add/edit forms are present in code but currently disabled in the UI.

---

## License

MIT License

---

## Support

For issues, feature requests, or questions:
- Check existing issues in the project repository.
- Create a new issue with a detailed description.

---

**Note:** This application is designed for personal use and small collections. For large-scale or commercial use, consider adding a database backend and user authentication.