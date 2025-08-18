# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Comic Book Collection Manager - a modern React/TypeScript web application for managing and tracking personal comic book collections. The app features comprehensive collection management, advanced analytics, responsive design, and data import/export capabilities.

## Core Technologies

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite with optimized code splitting
- **Styling**: Tailwind CSS with custom responsive utilities
- **State Management**: Zustand (centralized) + Custom React hooks (legacy)
- **Icons**: Lucide React
- **Validation**: Zod schemas

## Essential Commands

### Development
```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Testing
**Note**: This project currently has no automated testing framework configured. Tests would need to be set up manually.

## Architecture Overview

### State Management Architecture
The project is currently **in transition** between two state management approaches:

1. **Legacy Hook-based**: `src/hooks/useComics.ts` - Original implementation with React hooks
2. **New Zustand Store**: `src/stores/comicStore.ts` - Modern centralized state management

**Important**: When making changes, prefer the Zustand store approach as it's the target architecture.

### Component Architecture

#### Core Layout Structure
- `App.tsx` - Main application component with routing logic
- `Dashboard.tsx` - Statistics and analytics dashboard
- `ComicCard.tsx` / `ComicListView.tsx` - Collection display components

#### Lazy-Loaded Components
All detail views are lazy-loaded for performance:
- `ComicDetail.tsx` - Individual comic details
- `SeriesDetail.tsx` - Series-specific views
- `StorageLocationDetail.tsx` - Storage location views
- `CoverArtistDetail.tsx` - Artist-specific views
- `TagDetail.tsx` - Tag-specific views
- `*ComicsDetail.tsx` - Condition-specific views (Raw/Slabbed/Variants)

### Data Flow Architecture

#### Data Storage
- **Primary**: `src/data/comics.json` - Main comic collection data
- **Format**: JSON array of Comic objects
- **Schema**: Defined in `src/types/Comic.ts` with Zod validation

#### State Flow
1. Data loaded from JSON on app startup
2. Zustand store manages centralized state
3. Components subscribe to specific store slices
4. Filtering/sorting handled by `useComicFilters` hook
5. Navigation state managed centrally in store

### Performance Architecture

#### Code Splitting Strategy (Vite Config)
- **React Vendor**: React + React-DOM separately chunked
- **Icons**: Lucide icons in separate chunk
- **Components**: Core components bundled together
- **Utils**: Hooks and utilities in separate chunk
- **Data**: Comic data in separate chunk

#### Optimization Features
- Lazy loading for all detail components
- Memoized filtering with custom hooks
- Responsive image handling with fallbacks
- Selective Zustand subscriptions

## Key Development Patterns

### Component Organization
```
src/components/
├── Core components (Dashboard, ComicCard, etc.)
├── Detail components (*Detail.tsx - lazy loaded)
├── Form components (ComicForm, CsvConverter)
├── UI utilities (LoadingSkeleton, ResponsiveImage)
└── lazyComponents.ts - Centralized lazy loading
```

### State Management Pattern
```typescript
// Preferred: Zustand store
const { comics, addComic, navigateToComic } = useComicStore();

// Legacy: Hook-based (being phased out)
const { comics, addComic } = useComics();
```

### Navigation Pattern
The app uses a centralized navigation system through the Zustand store:
```typescript
// All navigation goes through store actions
navigateToComic(comic);
navigateToSeries(seriesName);
navigateToStorageLocation(location);
backToCollection();
```

### Data Validation Pattern
All comic data is validated using Zod schemas:
```typescript
// Schema defined in src/validation/comicSchema.ts
// Used for input validation and data integrity
```

## Common Development Tasks

### Adding New Comic Properties
1. Update `Comic` interface in `src/types/Comic.ts`
2. Update Zod schema in `src/validation/comicSchema.ts`
3. Update form in `ComicForm.tsx`
4. Update display components as needed

### Adding New Views/Pages
1. Create component in `src/components/`
2. Add lazy loading in `lazyComponents.ts`
3. Add navigation logic to Zustand store
4. Update `App.tsx` routing logic

### Performance Debugging
Use the performance utilities:
```typescript
import { measurePerformance } from './src/utils/performance';
```

### Data Management
- **Import**: Use CSV Converter component for bulk imports
- **Export**: Implemented in storage utilities
- **Backup**: JSON files can be directly copied
- **Structure**: Each comic requires unique ID and timestamps

## Important File Locations

### Critical Configuration
- `vite.config.ts` - Build configuration with code splitting
- `tailwind.config.js` - Styling configuration
- `eslint.config.js` - Linting rules

### Core Logic
- `src/stores/comicStore.ts` - Main state management (preferred)
- `src/hooks/useComics.ts` - Legacy state management
- `src/hooks/useComicFilters.ts` - Optimized filtering logic
- `src/types/Comic.ts` - TypeScript interfaces
- `src/validation/comicSchema.ts` - Data validation schemas

### Data Files
- `src/data/comics.json` - Main collection data
- `example-comic-collection.json` - Sample data structure

## Project Status Notes

### Recent Improvements (from IMPROVEMENTS.md)
- Migrated to Zustand for state management
- Added comprehensive Zod validation
- Implemented centralized lazy loading
- Enhanced error boundaries and image handling
- Optimized filtering performance

### Current Limitations
- No automated testing framework
- Single-user application (no authentication)
- JSON file storage (not database)
- External image hosting required

### Migration Status
The codebase is currently transitioning from hook-based state management to Zustand. When working on components, prefer using the Zustand store (`useComicStore`) over the legacy `useComics` hook.

## Development Environment Notes

- Uses ES modules throughout
- TypeScript strict mode enabled
- Responsive design targets 320px to 4K displays
- Optimized for both desktop and mobile touch interfaces
- Bundle size warnings at 600KB chunks (Vite config)

## Data Structure Understanding

The Comic interface includes financial tracking (purchase price vs current value), condition tracking (raw vs slabbed), organization features (tags, storage locations), and metadata (signatures, variant status). Understanding this structure is crucial for effective development.
