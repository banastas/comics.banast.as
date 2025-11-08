# App Icons TODO

The following icon files are referenced in the HTML but need to be created:

## Required Icons

### Favicons
- [x] `favicon.svg` - SVG favicon (exists, using default Vite)
- [ ] `favicon-32x32.png` - 32x32 PNG favicon
- [ ] `favicon-16x16.png` - 16x16 PNG favicon

### Mobile App Icons
- [ ] `apple-touch-icon.png` - 180x180 for iOS
- [ ] `safari-pinned-tab.svg` - Safari pinned tab icon
- [ ] `android-chrome-192x192.png` - 192x192 for Android
- [ ] `android-chrome-512x512.png` - 512x512 for Android
- [ ] `icon-192.png` - 192x192 general icon
- [ ] `icon-512.png` - 512x512 general icon

### PWA Shortcut Icons (Optional)
- [ ] `icon-collection.png` - 96x96 for Collection shortcut
- [ ] `icon-stats.png` - 96x96 for Statistics shortcut

### Social Sharing
- [ ] `og-image.jpg` - 1200x630 Open Graph image
- [ ] `twitter-image.jpg` - 1200x630 Twitter Card image

### Screenshots (Optional for PWA)
- [ ] `screenshot-mobile.png` - 375x812 mobile screenshot
- [ ] `screenshot-desktop.png` - 1920x1080 desktop screenshot

## Design Guidelines

### Theme
- **Primary Color**: #3b82f6 (blue-500)
- **Background**: #1f2937 (gray-800)
- **Accent**: #111827 (gray-900)

### Icon Concept Ideas
1. **Comic Book Icon**: Stylized comic book with pages
2. **Collection Icon**: Stack of comic books
3. **Library Icon**: Bookshelf with comics
4. **Badge Icon**: Comic collection badge/seal
5. **Speech Bubble**: Classic comic speech bubble with "C" inside

### Tools to Create Icons
- **Figma**: https://www.figma.com/
- **Favicon.io**: https://favicon.io/ (quick generator)
- **RealFaviconGenerator**: https://realfavicongenerator.net/ (comprehensive)
- **Canva**: https://www.canva.com/ (for social images)

## Quick Solution

### Using Favicon.io
1. Visit https://favicon.io/favicon-generator/
2. Create a simple text-based favicon with "C" or comic book emoji
3. Download the package
4. Extract files to the `public/` directory

### Using RealFaviconGenerator
1. Visit https://realfavicongenerator.net/
2. Upload a source image (512x512 recommended)
3. Customize for each platform
4. Download and extract to `public/` directory

## Priority

**High Priority** (needed for PWA):
- favicon.svg (or .ico)
- apple-touch-icon.png
- android-chrome-192x192.png
- android-chrome-512x512.png

**Medium Priority** (for better social sharing):
- og-image.jpg
- twitter-image.jpg

**Low Priority** (nice to have):
- All other icons and screenshots

## Notes

The site currently works with the default Vite favicon. Creating custom icons will:
1. Improve brand recognition
2. Enhance PWA experience
3. Better social media previews
4. Professional appearance in browser tabs

Once icons are created, they will automatically be used by the existing HTML/manifest references.
