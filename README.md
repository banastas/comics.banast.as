# Comic Book Collection Manager

A modern, responsive web application for managing and tracking your comic book collection. Built with React, TypeScript, and Tailwind CSS.

---

## Features

### 🗂️ Collection Management
- **Comprehensive Comic Details**: Track title, series, issue number, release date, grade, purchase price, current value, cover artist, storage location, tags, notes, and more.
- **Cover Art Display**: Visual representation of your collection with cover image support and graceful fallbacks.
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
- **Search**: Quickly find comics by title, series, notes, cover artist, and more.
- **Grid/List Views**: Switch between grid and list layouts for browsing.
- **Sorting**: Sort by title, series, issue, grade, value, date, and more with newest releases shown first by default.
- **Detail Pages**: Click any comic, series, tag, artist, storage location, or variant to view detailed breakdowns.
- **Clickable Info Cards**: All dashboard/statistics cards (Raw, Slabbed, Variants, Virtual Boxes) are clickable and navigate to their respective detail pages.
- **Series Navigation**: Series boxes in all detail pages are clickable and navigate to the series detail view.
- **Responsive Design**: Fully mobile, tablet, and desktop friendly with optimized touch targets.

### 🏷️ Tag, Artist, and Storage Location Views
- **Tag Detail Pages**: Browse all comics with a specific tag.
- **Cover Artist Pages**: Browse all comics by a specific cover artist.
- **Storage Location Pages**: See all comics in a specific virtual box/storage location.
- **Storage Locations Listing**: View all storage locations with summary stats and click through to detail.

### 🏆 Variants & Special Views
- **Variants Detail Page**: Dedicated page for all variant comics, with clickable info cards and series navigation.
- **Raw/Slabbed Detail Pages**: Dedicated pages for raw and slabbed comics, with series navigation and statistics.

### 📁 Data Import/Export
- **CSV to JSON Converter**: Built-in tool to convert CSV files to the required JSON format.
- **File Upload Interface**: Easy-to-use interface for importing comic data.
- **Data Validation**: Automatic validation and error handling during import.

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

- **Data is managed by editing `src/data/comics.json` directly.**
- Add a new comic object to the array with all required fields.
- Ensure the `id` is unique and dates are in ISO format (`YYYY-MM-DD`).
- Save the file—changes are reflected immediately.
- **CSV Import**: Use the built-in CSV converter to import data from spreadsheets.

---

## Using the Application

### Browsing Your Collection
- Use the search bar to find comics by title, series, notes, cover artist, or other fields.
- Switch between grid and list views using the view toggle buttons.
- Sort comics by various criteria (newest releases shown first by default).
- Click any comic for a detailed view with comprehensive information.

### Viewing Statistics
- Go to the Statistics tab for comprehensive analytics.
- Click any info card (Raw, Slabbed, Variants, Virtual Boxes) to navigate to detail pages.
- Explore series performance, top series by count, recent additions, and virtual box organization.

### Navigation Between Views
- Click on series names, tags, cover artists, or storage locations to drill down.
- Use badges and info cards for quick navigation to raw, slabbed, or variant comics.
- All clickable elements provide hover states for better user experience.

### Data Import
- Use the CSV Converter (accessible via the file icon in the header) to import data.
- Upload a CSV file with the expected column format.
- Download the converted JSON file and replace `src/data/comics.json`.

---

## Performance & Optimization

### Code Splitting
- **Lazy Loading**: Detail pages and forms load on demand for faster initial load times.
- **Bundle Optimization**: Separate chunks for vendors, utilities, and components.
- **Responsive Images**: Optimized image loading with fallbacks for missing covers.

### Responsive Design
- **Mobile-First**: Optimized for all screen sizes from 320px to 4K displays.
- **Touch Targets**: Minimum 44px touch targets for mobile accessibility.
- **Fluid Typography**: Text scales appropriately across all devices.
- **Performance Monitoring**: Built-in utilities for tracking performance metrics.

---

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom responsive utilities
- **Icons**: Lucide React
- **Build Tool**: Vite with optimized chunking
- **State Management**: React hooks with custom useComics hook
- **Data Storage**: JSON file (easily replaceable with a database)
- **Performance**: Code splitting, lazy loading, and responsive image handling

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

### Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main statistics dashboard
│   ├── ComicCard.tsx    # Grid view comic cards
│   ├── ComicDetail.tsx  # Individual comic detail page
│   ├── ComicForm.tsx    # Add/edit comic form
│   ├── *Detail.tsx      # Various detail page components
│   └── ...
├── hooks/
│   ├── useComics.ts     # Main data management hook
│   └── ...
├── types/
│   └── Comic.ts         # TypeScript interfaces
├── utils/
│   └── performance.ts   # Performance utilities
├── data/
│   └── comics.json      # Comic collection data
└── styles/
    └── responsive.css   # Additional responsive styles
```

---

## Key Features in Detail

### Financial Tracking
- **Precise Pricing**: All prices display with full cents (e.g., $3.24, not $3)
- **Gain/Loss Tracking**: Automatic calculation of value changes
- **Performance Analytics**: Series-level and individual comic performance
- **Purchase vs Current Value**: Clear comparison of investment performance

### Collection Organization
- **Series Management**: Group and analyze comics by series
- **Virtual Storage**: Organize comics by storage location/boxes
- **Tag System**: Flexible tagging for custom organization
- **Condition Tracking**: Separate views for raw and slabbed comics

### User Experience
- **Fast Loading**: Code splitting ensures quick initial load times
- **Responsive Design**: Optimized for all devices and screen sizes
- **Intuitive Navigation**: Click-through navigation between related items
- **Visual Feedback**: Hover states and transitions throughout the interface

---

## Data Import & Management

### CSV Import Process
1. **Prepare CSV**: Ensure your CSV has the required columns (see CSV Converter for details)
2. **Access Converter**: Click the file icon in the header to open the CSV converter
3. **Upload File**: Select your CSV file for conversion
4. **Download JSON**: Get the converted JSON file
5. **Replace Data**: Replace `src/data/comics.json` with your new file

### Required CSV Columns
- `title`, `seriesName`, `issueNumber`, `releaseDate`
- `coverImageUrl`, `coverArtist`, `grade`
- `purchasePrice`, `purchaseDate`, `currentValue`
- `notes`, `signedBy`, `storageLocation`, `tags`
- `isSlabbed`, `isVariant`, `isGraphicNovel`

---

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+, Samsung Internet 13+
- **Performance**: Optimized for both desktop and mobile devices
- **Accessibility**: WCAG AA compliant with proper contrast ratios and touch targets

---

## Known Limitations

- **Data Storage**: Uses JSON file instead of database (easily upgradeable)
- **Single User**: No authentication or multi-user support
- **Image Hosting**: Cover images must be hosted externally
- **Manual Data Management**: No automated backup or sync features

---

## Future Enhancements

- **Database Integration**: Easy migration to Supabase or other databases
- **User Authentication**: Multi-user support with personal collections
- **Image Upload**: Direct cover image upload and hosting
- **Automated Backups**: Cloud backup and sync capabilities
- **Mobile App**: Progressive Web App features for mobile installation

---

## License

MIT License

---

## Support

For issues, feature requests, or questions:
- Check existing issues in the project repository
- Create a new issue with a detailed description
- Review the documentation for common solutions

---

**Note:** This application is designed for personal use and small to medium collections. The responsive design and performance optimizations make it suitable for collections of any size, with the ability to easily scale to database storage when needed.