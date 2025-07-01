# Comic Book Collection Manager

A modern, responsive web application for managing and tracking your comic book collection. Built with React, TypeScript, and Tailwind CSS.

## Features

### Collection Management
- **Comprehensive Comic Details**: Track title, series, issue number, release date, grade, purchase price, current value, and more
- **Cover Art Display**: Visual representation of your collection with cover image support
- **Condition Tracking**: Distinguish between raw and slabbed comics
- **Signature Tracking**: Record signed comics and who signed them
- **Storage Location Management**: Keep track of where your comics are stored
- **Tagging System**: Organize comics with custom tags
- **Notes**: Add detailed notes about each comic

### Advanced Features
- **Variant Cover Support**: Track variant covers separately
- **Graphic Novel Classification**: Distinguish graphic novels from regular issues
- **Value Tracking**: Monitor purchase price vs current market value
- **Performance Analytics**: Track gains/losses across your collection
- **Search Functionality**: Quick search across comic titles, series, notes, and more
- **Multiple View Modes**: Grid and list views for different browsing preferences

### Statistics & Analytics
- **Collection Overview**: Total comics, value, average grade
- **Performance Tracking**: Biggest gainers/losers, total gain/loss percentages
- **Condition Breakdown**: Raw vs slabbed comic statistics
- **Series Analysis**: Detailed breakdowns by comic series
- **Storage Analytics**: Value distribution across storage locations
- **Recent Activity**: Track recently added comics

### Navigation & Views
- **Series Detail Pages**: View all issues from a specific series
- **Storage Location Views**: See all comics in a specific location
- **Cover Artist Pages**: Browse comics by cover artist
- **Tag-based Browsing**: Browse collection by tags
- **Condition Views**: Separate views for raw and slabbed comics

## Dynamic Interface

### Conditional Statistics Display
The statistics dashboard automatically hides information boxes when their values are zero or null:
- **Slabbed Comics**: Only appears when you have slabbed comics in your collection
- **Raw Comics**: Only appears when you have raw comics in your collection  
- **Signed Comics**: Only appears when you have signed comics (detailed statistics view only)
- **Performance Metrics**: Gain/loss statistics only appear when comics have current value data

This creates a cleaner interface that only shows relevant information based on your collection's content.

### Responsive Design
The interface adapts seamlessly across all device sizes with:
- **Mobile-first Design**: Optimized for touch interfaces and small screens
- **Tablet Support**: Enhanced layouts for medium-sized screens
- **Desktop Experience**: Full-featured interface with expanded controls

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Icons**: Lucide React icon library
- **Build Tool**: Vite for fast development and building
- **State Management**: React hooks (useState, useEffect, useCallback) with custom hooks for data management
- **Data Storage**: JSON file-based storage (easily replaceable with database)

## Project Structure

```
src/
├── components/           # React components
│   ├── ComicCard.tsx    # Individual comic display card
│   ├── ComicDetail.tsx  # Detailed comic view page
│   ├── ComicForm.tsx    # Add/edit comic form (currently disabled)
│   ├── Dashboard.tsx    # Statistics dashboard with conditional rendering
│   ├── FilterControls.tsx # Search and filter interface (currently disabled)
│   ├── SeriesDetail.tsx # Series-specific view
│   ├── StorageLocationDetail.tsx # Storage location view
│   ├── CoverArtistDetail.tsx # Cover artist view
│   ├── TagDetail.tsx    # Tag-specific view
│   ├── RawComicsDetail.tsx # Raw comics view
│   └── SlabbedComicsDetail.tsx # Slabbed comics view
├── data/
│   └── comics.json      # Comic collection data
├── hooks/
│   └── useComics.ts     # Main data management hook
├── types/
│   └── Comic.ts         # TypeScript type definitions
├── App.tsx              # Main application component
└── main.tsx            # Application entry point
```

## Data Management

### Comic Data Structure
Each comic in the collection has the following properties:

```typescript
interface Comic {
  id: string;                    // Unique identifier
  title: string;                 // Comic title
  seriesName: string;           // Series name
  issueNumber: number;          // Issue number
  releaseDate: string;          // Publication date (ISO format)
  coverImageUrl: string;        // URL to cover image
  coverArtist: string;          // Cover artist name
  grade: number;                // Condition grade (0.5-10.0)
  purchasePrice: number;        // Amount paid for comic
  purchaseDate: string;         // Date purchased (ISO format)
  currentValue?: number;        // Current market value (optional)
  notes: string;                // Additional notes
  signedBy: string;             // Signature information
  storageLocation: string;      // Where comic is stored
  tags: string[];               // Custom tags
  isSlabbed: boolean;           // Professional grading status
  isVariant?: boolean;          // Variant cover flag
  isGraphicNovel?: boolean;     // Graphic novel flag
  createdAt: string;            // Record creation date
  updatedAt: string;            // Last update date
}
```

### Adding New Comics

Currently, comic addition is handled by editing the `src/data/comics.json` file directly. To add a new comic:

1. Open `src/data/comics.json`
2. Add a new comic object to the array with all required fields
3. Ensure the `id` is unique
4. Use proper ISO date format for dates (`YYYY-MM-DD`)
5. Save the file - changes will be reflected immediately

### Modifying Existing Comics

To modify existing comics:
1. Locate the comic in `src/data/comics.json` by its `id`
2. Update the desired fields
3. Update the `updatedAt` timestamp
4. Save the file

## Using the Application

### Browsing Your Collection
- Use the search bar in the header to find specific comics
- Switch between grid and list views using the view toggle buttons
- Sort comics by various criteria using the sort dropdown
- Click on any comic to view detailed information

### Viewing Statistics
- Navigate to the Statistics tab to see comprehensive collection analytics
- Statistics boxes automatically hide when values are zero or null
- Click on performance highlights to view specific comics
- Explore series breakdowns and storage location analytics

### Navigation Between Views
- Click on series names to view all comics in that series
- Click on storage locations to see comics stored in specific locations
- Click on cover artist names to browse their cover art
- Click on tags to filter by specific categories
- Use condition badges to view all raw or slabbed comics

## Customization

### Adding New Features

#### New Comic Properties
1. Add the property to the `Comic` interface in `src/types/Comic.ts`
2. Update the form component in `src/components/ComicForm.tsx`
3. Update display components as needed
4. Add the property to existing comic data

#### New Statistics
1. Add calculation logic to `src/hooks/useComics.ts`
2. Update the `ComicStats` interface in `src/types/Comic.ts`
3. Display the new statistic in `src/components/Dashboard.tsx`
4. Consider adding conditional rendering for zero/null values

### Styling Customization

The application uses Tailwind CSS for styling. Key customization points:

- **Colors**: Modify color schemes in component files
- **Layout**: Adjust grid layouts and spacing in component files
- **Typography**: Update text sizes and fonts using Tailwind classes
- **Responsive Design**: Modify breakpoints and responsive behavior

### Cover Images

Cover images are referenced by URL in the `coverImageUrl` field. You can:
- Use external image hosting services
- Host images locally in the `public` directory
- Use placeholder images for comics without covers

## Development

### Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Preview Production Build**:
   ```bash
   npm run preview
   ```

### Development Workflow

1. **Adding Features**: Create new components in `src/components/`
2. **Data Changes**: Modify `src/data/comics.json` for content updates
3. **Type Safety**: Update TypeScript interfaces in `src/types/`
4. **State Management**: Extend `src/hooks/useComics.ts` for new functionality

## Known Issues & Limitations

### Current Limitations
- **No Database**: Data is stored in a JSON file, limiting scalability
- **No User Authentication**: Single-user application
- **No Image Upload**: Cover images must be hosted externally
- **No Backup System**: Data loss risk if JSON file is corrupted
- **No Import/Export**: No CSV or other format support
- **Form Disabled**: Add/edit functionality is currently disabled in the UI
- **Filtering Interface**: Advanced filtering controls are currently disabled in the UI

### Development Status
Some features are temporarily disabled while the application is being refined:
- Comic add/edit forms
- Advanced filtering controls

These features exist in the codebase but are commented out in the UI for a cleaner user experience.

### Potential Improvements
- Database integration (PostgreSQL, MongoDB, etc.)
- User authentication and multi-user support
- Image upload and management system
- Data backup and restore functionality
- Import/export capabilities (CSV, Excel, etc.)
- Mobile app version
- Barcode scanning for quick comic addition
- Price tracking integration with market data APIs
- Advanced reporting and analytics

## Troubleshooting

### Common Issues

1. **Images Not Loading**: Check that `coverImageUrl` values are valid and accessible
2. **Data Not Updating**: Ensure JSON syntax is valid in `comics.json`
3. **Build Errors**: Run `npm run lint` to check for TypeScript errors
4. **Performance Issues**: Large collections may benefit from pagination

### Error Handling

The application includes basic error handling for:
- Invalid image URLs (shows placeholder)
- Missing data fields (uses defaults)
- JSON parsing errors (falls back to empty collection)

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Use Tailwind CSS for styling
- Implement responsive design for all new features

### Testing
- Test new features across different screen sizes
- Verify data integrity when modifying JSON structure
- Check performance with large datasets

## License

This project is open source and available under the MIT License.

## Support

For issues, feature requests, or questions:
1. Check existing issues in the project repository
2. Create a new issue with detailed description
3. Include steps to reproduce for bugs
4. Provide mockups or examples for feature requests

---

**Note**: This application is designed for personal use and small collections. For large-scale commercial use, consider implementing a proper database backend and user authentication system.