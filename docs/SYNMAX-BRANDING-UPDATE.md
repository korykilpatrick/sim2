# SynMax Branding Update Guide

## Overview
This document outlines the branding and UI/UX updates implemented to align the SIM platform with SynMax's visual identity and the provided Figma mockups.

## Color Palette Updates

### Primary Colors
- **Calypso Blue**: `#00a4bd` - Main brand color used for primary actions and accents
- **Bright Green**: `#00e96c` - Secondary color for success states and highlights
- **Lime Green**: `#8bff5b` - Accent color for gradients and special elements
- **Dark Navy**: `#131c2a` - Primary dark color for headers and backgrounds

### Gradients
- **Primary Gradient**: `linear-gradient(135deg, #00e96c 0%, #8bff5b 100%)`
- **Dark Gradient**: `linear-gradient(180deg, #131c2a 0%, #0f1622 100%)`

## Typography
- Primary font: Graphie (fallback to Inter)
- Font variants: Graphie Light, Graphie Bold
- Consistent hierarchy maintained across all pages

## Component Updates

### 1. Button Component
- Added new `synmax` variant with gradient background
- Updated hover states with elevation and shadow effects
- Increased border radius for modern look

### 2. Header Component
- Dark navy background matching SynMax branding
- Added shopping cart icon with badge
- Updated user menu with better visual hierarchy
- Credits display moved to dedicated link

### 3. HomePage
- Hero section with dark gradient background
- Product grid with hover animations
- Promotional banner with gradient
- Card hover effects with elevation

### 4. Login/Register Pages
- Split-screen layout with branding panel
- Dark gradient background on right panel
- Statistics display for social proof
- Updated form styling

### 5. Cart Page (New)
- Clean card-based layout
- Order summary sidebar
- Support for both credit and cash purchases
- Consistent with e-commerce patterns

## Design Patterns Implemented

### From Figma Mockups
1. **Marketplace Layout**: Grid-based product display with hover effects
2. **Navigation**: Dark header with logo, cart, and user menu
3. **Forms**: Clean input fields with proper spacing and validation
4. **Cards**: White background with subtle shadows
5. **CTAs**: Primary actions use gradient buttons
6. **Color Usage**: Strategic use of brand colors for hierarchy

### Visual Enhancements
- Consistent spacing using 4px base unit
- Subtle animations for interactions
- Elevation changes on hover
- Gradient accents for visual interest

## Files Modified

### Configuration
- `tailwind.config.js` - Updated color palette and font families
- `src/index.css` - Added CSS variables and utility classes

### Components
- `src/components/common/Button.tsx` - Added synmax variant
- `src/components/layout/Header.tsx` - Complete redesign

### Pages
- `src/pages/HomePage.tsx` - Marketplace layout implementation
- `src/features/auth/pages/LoginPage.tsx` - Split-screen design
- `src/pages/CartPage.tsx` - New cart functionality

### Documentation
- `docs/design/DESIGN-SYSTEM.md` - Updated with SynMax branding

## Next Steps

To fully implement the PRD requirements, the following features still need development:

1. **Vessel Tracking Service (VTS)** - Alert criteria configuration
2. **Area Monitoring Service (AMS)** - Map visualization
3. **Fleet Tracking Service (FTS)** - Fleet dashboard
4. **Reports Generation** - Compliance and chronology reports
5. **Maritime Investigation Service (MIS)** - RFI submission
6. **Credits System** - Purchase and redemption workflows
7. **User Portal** - Alert management and notifications

## Usage Guidelines

### Do's
- Use gradient buttons for primary CTAs
- Maintain dark header across all pages
- Use brand colors consistently
- Keep card-based layouts for content

### Don'ts
- Don't use generic blue colors
- Avoid flat designs without depth
- Don't mix old and new button styles
- Avoid breaking the established grid