# Design System Guide

## Overview
This document defines the visual language, design tokens, and styling foundation for the SynMax Intelligence Marketplace (SIM) application. The design system aligns with SynMax's brand identity, using Tailwind CSS as the primary styling solution with custom extensions for brand consistency.

## Design Principles

1. **Clarity First** - Information hierarchy and readability above all
2. **Consistent Spacing** - Use spacing scale religiously  
3. **Purposeful Color** - Every color has meaning and function
4. **Responsive by Default** - Mobile-first, fluid layouts
5. **Accessible Always** - WCAG AA compliance minimum

## Color System

### Brand Colors (SynMax)
```css
/* tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        // SynMax brand colors
        primary: {
          50: '#e6f4f7',
          100: '#cce9ef',
          200: '#99d3df',
          300: '#66bdcf',
          400: '#33a7bf',
          500: '#00a4bd',  // SynMax calypso blue
          600: '#008397',
          700: '#006271',
          800: '#00414b',
          900: '#002025',
          950: '#001013'
        },
        secondary: {
          50: '#e6ffec',
          100: '#ccffda',
          200: '#99ffb5',
          300: '#66ff90',
          400: '#33ff6b',
          500: '#00e96c',  // SynMax bright green
          600: '#00ba56',
          700: '#008c41',
          800: '#005d2b',
          900: '#002f16',
          950: '#00170b'
        },
        accent: {
          50: '#f0ffe6',
          100: '#e1ffcc',
          200: '#c3ff99',
          300: '#a5ff66',
          400: '#8bff5b',  // SynMax lime green
          500: '#6fe633',
          600: '#59b829',
          700: '#438a1f',
          800: '#2d5c14',
          900: '#172e0a',
          950: '#0b1705'
        },
        dark: {
          50: '#e7e8ea',
          100: '#cfd1d5',
          200: '#9fa3ab',
          300: '#6f7581',
          400: '#3f4757',
          500: '#131c2a',  // SynMax dark navy
          600: '#0f1622',
          700: '#0b1119',
          800: '#070b11',
          900: '#040608',
          950: '#020304'
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712'
        }
      }
    }
  }
}
```

### Semantic Colors
```css
/* Functional color mappings */
colors: {
  // Status colors
  success: '#00e96c',  // SynMax green
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#00a4bd',     // SynMax calypso
  
  // UI colors
  background: {
    primary: colors.white,
    secondary: colors.neutral[50],
    tertiary: colors.neutral[100],
    inverse: colors.neutral[900]
  },
  
  border: {
    light: colors.neutral[200],
    DEFAULT: colors.neutral[300],
    dark: colors.neutral[400]
  },
  
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[400],
    inverse: colors.white
  }
}
```

### Dark Mode Colors
```css
/* Dark mode overrides */
.dark {
  --color-bg-primary: theme('colors.neutral.900');
  --color-bg-secondary: theme('colors.neutral.800');
  --color-text-primary: theme('colors.neutral.100');
  --color-border: theme('colors.neutral.700');
}
```

## Typography System

### Font Stack
```css
fontFamily: {
  sans: ['Graphie', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
  'sans-light': ['Graphie Light', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
  'sans-bold': ['Graphie Bold', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['JetBrains Mono', 'Consolas', 'monospace']
}
```

### Type Scale
```css
fontSize: {
  'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
  'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
  'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  '5xl': ['3rem', { lineHeight: '1' }],           // 48px
}
```

### Font Weights
```css
fontWeight: {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700'
}
```

### Typography Components
```css
/* Heading styles */
.h1 {
  @apply text-4xl font-bold text-neutral-900 dark:text-neutral-100;
}

.h2 {
  @apply text-3xl font-semibold text-neutral-900 dark:text-neutral-100;
}

.h3 {
  @apply text-2xl font-semibold text-neutral-800 dark:text-neutral-200;
}

.h4 {
  @apply text-xl font-medium text-neutral-800 dark:text-neutral-200;
}

/* Body text styles */
.body-large {
  @apply text-lg text-neutral-700 dark:text-neutral-300;
}

.body {
  @apply text-base text-neutral-700 dark:text-neutral-300;
}

.body-small {
  @apply text-sm text-neutral-600 dark:text-neutral-400;
}

/* Special text */
.label {
  @apply text-sm font-medium text-neutral-700 dark:text-neutral-300;
}

.caption {
  @apply text-xs text-neutral-500 dark:text-neutral-500;
}
```

## Spacing System

### Base Unit: 4px (0.25rem)
```css
spacing: {
  '0': '0px',
  'px': '1px',
  '0.5': '0.125rem',  // 2px
  '1': '0.25rem',     // 4px
  '2': '0.5rem',      // 8px
  '3': '0.75rem',     // 12px
  '4': '1rem',        // 16px
  '5': '1.25rem',     // 20px
  '6': '1.5rem',      // 24px
  '8': '2rem',        // 32px
  '10': '2.5rem',     // 40px
  '12': '3rem',       // 48px
  '16': '4rem',       // 64px
  '20': '5rem',       // 80px
  '24': '6rem',       // 96px
}
```

### Spacing Guidelines
- **Micro**: 4px, 8px - Icon spacing, dense lists
- **Small**: 12px, 16px - Form elements, card padding
- **Medium**: 24px, 32px - Section spacing, card gaps
- **Large**: 48px, 64px - Page sections, major divisions

## Layout System

### Container Sizes
```css
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet portrait
  'lg': '1024px',  // Tablet landscape
  'xl': '1280px',  // Desktop
  '2xl': '1536px'  // Large desktop
}

/* Container max-widths */
.container {
  @apply mx-auto px-4 sm:px-6 lg:px-8;
}

.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }
```

### Grid System
```css
/* 12-column grid */
gridTemplateColumns: {
  'layout': 'repeat(12, minmax(0, 1fr))',
}

/* Common layouts */
.sidebar-layout {
  @apply grid grid-cols-12 gap-6;
  
  .sidebar { @apply col-span-12 lg:col-span-3; }
  .main { @apply col-span-12 lg:col-span-9; }
}
```

## Component Tokens

### Border Radius
```css
borderRadius: {
  'none': '0',
  'sm': '0.125rem',   // 2px
  'DEFAULT': '0.25rem', // 4px
  'md': '0.375rem',    // 6px
  'lg': '0.5rem',      // 8px
  'xl': '0.75rem',     // 12px
  '2xl': '1rem',       // 16px
  'full': '9999px'
}
```

### Shadows
```css
boxShadow: {
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  'none': 'none'
}
```

### Z-Index Scale
```css
zIndex: {
  '0': '0',
  '10': '10',    // Sticky elements
  '20': '20',    // Fixed headers
  '30': '30',    // Dropdowns
  '40': '40',    // Tooltips
  '50': '50',    // Modals
  '60': '60',    // Notifications
  '70': '70',    // Command palette
  '9999': '9999' // Debug
}
```

## Icon System

### Icon Sizes
```css
/* Standard icon sizes matching text */
.icon-xs { @apply w-3 h-3; }   // 12px
.icon-sm { @apply w-4 h-4; }   // 16px
.icon-md { @apply w-5 h-5; }   // 20px
.icon-lg { @apply w-6 h-6; }   // 24px
.icon-xl { @apply w-8 h-8; }   // 32px
```

### Icon Guidelines
- Use Lucide React for consistency
- Always include aria-label for standalone icons
- Match icon size to adjacent text size
- Use currentColor for easy theming

## Motion & Animation

### Timing Functions
```css
transitionTimingFunction: {
  'DEFAULT': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'in': 'cubic-bezier(0.4, 0, 1, 1)',
  'out': 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
}
```

### Duration Scale
```css
transitionDuration: {
  '75': '75ms',   // Micro interactions
  '100': '100ms', // Hover states
  '150': '150ms', // Default transitions
  '200': '200ms', // Panel slides
  '300': '300ms', // Modal opens
  '500': '500ms', // Page transitions
}
```

## Utility Classes

### Focus States
```css
/* Accessible focus rings */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

.focus-ring-inset {
  @apply focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500;
}
```

### Truncation
```css
.truncate-lines-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.truncate-lines-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### Scrollbar Styling
```css
/* Custom scrollbar */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: theme('colors.neutral.400') transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  @apply bg-transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  @apply bg-neutral-400 rounded-full;
}
```

## Accessibility Utilities

### Screen Reader Only
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.not-sr-only {
  position: static;
  width: auto;
  height: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### Focus Management
```css
.focus-visible-only {
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500;
}
```

## Theme Configuration

### CSS Variables
```css
:root {
  /* Semantic variables */
  --color-brand: theme('colors.primary.500');
  --color-brand-hover: theme('colors.primary.600');
  
  /* Component variables */
  --header-height: 64px;
  --sidebar-width: 280px;
  --sidebar-collapsed-width: 64px;
  
  /* Transition variables */
  --transition-base: 150ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}
```

## Usage Guidelines

### Do's
- Use design tokens for all values
- Maintain consistent spacing
- Follow color semantics
- Use utility classes first
- Test in both light/dark modes

### Don'ts
- Don't use arbitrary values
- Don't create one-off colors
- Don't mix spacing units
- Don't override design tokens
- Don't ignore accessibility