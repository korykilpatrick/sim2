# Assets Directory

This directory contains static assets used throughout the application.

## Structure

- `/images` - Static images (logos, backgrounds, illustrations)
- `/icons` - Icon files (SVGs preferred)
- `/fonts` - Custom font files

## Guidelines

1. **Images**

   - Use optimized formats (WebP for photos, SVG for graphics)
   - Provide multiple resolutions for responsive images
   - Name files descriptively: `hero-background-desktop.webp`

2. **Icons**

   - Prefer SVG format for scalability
   - Use consistent naming: `icon-{name}.svg`
   - Consider using an icon library like Heroicons

3. **Fonts**
   - Include only necessary font weights
   - Provide WOFF2 format for better compression
   - Define in CSS with proper fallbacks

## Import Example

```typescript
// Importing an image
import logo from '@/assets/images/synmax-logo.svg'

// Using in component
<img src={logo} alt="Synmax Logo" />
```
