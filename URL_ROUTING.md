# URL Routing System

This document describes the comprehensive URL routing system implemented for the comic collection application.

## Overview

The application now supports full URL routing, allowing users to:
- Share direct links to specific comics, series, virtual boxes, etc.
- Use browser back/forward buttons
- Bookmark specific views
- Deep link into the application

## URL Structure

All URLs use hash-based routing with the following structure:
```
https://your-domain.com/#/route?query-parameters
```

## Available Routes

### Main Routes
- `/` - Home/Collection view
- `/collection` - Collection view (explicit)
- `/stats` - Statistics view

### Content Routes
- `/comic/{comic-id}` - Individual comic detail
- `/series/{series-name}` - Series detail page
- `/storage/{storage-location}` - Virtual box detail page
- `/artist/{artist-name}` - Cover artist detail page
- `/tag/{tag-name}` - Tag detail page

### Filter/View Routes
- `/raw` - Raw comics view
- `/slabbed` - Slabbed comics view
- `/variants` - Variants view
- `/boxes` - Virtual boxes listing
- `/csv` - CSV converter

## Query Parameters

All routes support the following query parameters:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `tab` | string | Active tab (collection/stats) | `?tab=stats` |
| `view` | string | View mode (grid/list) | `?view=list` |
| `search` | string | Search term | `?search=spider` |
| `sort` | string | Sort field | `?sort=title` |
| `order` | string | Sort direction (asc/desc) | `?order=asc` |

## Example URLs

### Comic Detail
```
https://comics.banast.as/#/comic/123e4567-e89b-12d3-a456-426614174000?tab=collection&view=grid
```

### Series View
```
https://comics.banast.as/#/series/Amazing%20Spider-Man?tab=collection&search=spider
```

### Virtual Box
```
https://comics.banast.as/#/storage/Box%201?tab=collection&view=list
```

### Statistics with Search
```
https://comics.banast.as/#/stats?search=marvel&sort=title&order=asc
```

### Raw Comics View
```
https://comics.banast.as/#/raw?tab=collection&view=grid
```

## Implementation Details

### URL Generation
The `utils/routing.ts` file provides functions for generating URLs:

```typescript
import { urls, getComicUrl, getSeriesUrl } from './utils/routing';

// Generate URLs
const comicUrl = getComicUrl(comic, { tab: 'collection', viewMode: 'grid' });
const seriesUrl = getSeriesUrl('Amazing Spider-Man', { searchTerm: 'spider' });
const homeUrl = urls.home({ tab: 'stats' });
```

### URL Parsing
The routing system automatically parses URLs and updates the application state:

```typescript
// URL: /comic/123?tab=collection&view=grid
// Results in:
// - selectedComic: comic with id '123'
// - activeTab: 'collection'
// - viewMode: 'grid'
```

### Navigation
Use the `navigateToRoute` function for programmatic navigation:

```typescript
const { navigateToRoute } = useRouting(/* ... */);

// Navigate to a comic
navigateToRoute('comic', comicId, { tab: 'collection' });

// Navigate to series
navigateToRoute('series', seriesName, { searchTerm: 'spider' });

// Navigate to virtual box
navigateToRoute('storage', locationName);
```

## Browser History

The system maintains proper browser history:
- Back/forward buttons work correctly
- URLs update when navigating
- State is preserved in URLs
- Direct URL access works

## Sharing URLs

### Share Button
A share button is available in the header that copies the current URL to clipboard.

### Programmatic Sharing
```typescript
import { getCurrentUrl, copyUrlToClipboard } from './utils/routing';

const url = getCurrentUrl();
const success = await copyUrlToClipboard(url);
```

## URL Encoding

All route parameters are properly URL encoded:
- Comic IDs are encoded as-is
- Series names, storage locations, etc. are URL encoded
- Special characters are handled correctly

## State Persistence

The following state is preserved in URLs:
- Current view (comic, series, etc.)
- Active tab (collection/stats)
- View mode (grid/list)
- Search terms
- Sort settings

## Error Handling

- Invalid comic IDs redirect to collection view
- Missing series redirect to collection view
- Malformed URLs fall back to home view
- Browser back/forward is handled gracefully

## Testing URLs

You can test the routing system by:

1. **Direct URL Access**: Paste any URL directly into the browser
2. **Browser Navigation**: Use back/forward buttons
3. **Share URLs**: Use the share button to copy URLs
4. **Bookmark URLs**: Bookmark any view and return to it later

## Future Enhancements

Potential future improvements:
- URL shortening for very long URLs
- QR code generation for mobile sharing
- URL preview metadata
- Analytics tracking for URL usage
- URL validation and sanitization

## Troubleshooting

### Common Issues

1. **URLs not updating**: Check that `navigateToRoute` is being called
2. **State not persisting**: Ensure all state is included in route parameters
3. **Back button not working**: Verify `useRouting` hook is properly set up
4. **Direct URL access failing**: Check URL parsing logic in `parseRoute`

### Debug Mode

Enable debug logging by adding to browser console:
```javascript
window.addEventListener('urlchange', (e) => console.log('URL changed:', e.detail));
```
