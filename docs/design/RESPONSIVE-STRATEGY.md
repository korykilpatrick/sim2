# Responsive Strategy Guide

## Overview
This document outlines the mobile-first responsive design strategy, breakpoint behaviors, and patterns for creating adaptive user interfaces that work seamlessly across all device sizes.

## Mobile-First Philosophy

### Core Principles
1. **Progressive Enhancement** - Start with mobile, add complexity for larger screens
2. **Content Priority** - Most important content is accessible on smallest screens
3. **Performance First** - Optimize for mobile constraints (bandwidth, processing)
4. **Touch Friendly** - Design for fingers first, enhance for mouse
5. **Flexible Layouts** - Use fluid grids and flexible images

### Implementation Strategy
```css
/* Mobile First CSS Structure */
.component {
  /* Mobile styles (default) */
  padding: 1rem;
  font-size: 0.875rem;
  
  /* Tablet and up */
  @media (min-width: 768px) {
    padding: 1.5rem;
    font-size: 1rem;
  }
  
  /* Desktop and up */
  @media (min-width: 1024px) {
    padding: 2rem;
  }
}
```

## Breakpoint System

### Standard Breakpoints
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Small devices (landscape phones)
      'md': '768px',   // Medium devices (tablets)
      'lg': '1024px',  // Large devices (desktops)
      'xl': '1280px',  // Extra large devices (large desktops)
      '2xl': '1536px', // 2X large devices (larger desktops)
    }
  }
}
```

### Device Categories
```typescript
export const deviceSizes = {
  mobile: {
    min: 320,
    max: 639,
    columns: 4,
    margin: 16,
    gutter: 16
  },
  tablet: {
    min: 640,
    max: 1023,
    columns: 8,
    margin: 24,
    gutter: 24
  },
  desktop: {
    min: 1024,
    max: 1279,
    columns: 12,
    margin: 32,
    gutter: 24
  },
  widescreen: {
    min: 1280,
    max: null,
    columns: 12,
    margin: 'auto',
    maxWidth: 1280,
    gutter: 32
  }
};
```

## Responsive Patterns

### Navigation Pattern

```typescript
// Responsive Navigation Component
export const Navigation: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center">
            <Logo />
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/vessels">Vessels</NavLink>
            <NavLink href="/reports">Reports</NavLink>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-neutral-400 hover:bg-neutral-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
            <MobileNavLink href="/vessels">Vessels</MobileNavLink>
            <MobileNavLink href="/reports">Reports</MobileNavLink>
          </div>
        </div>
      )}
    </nav>
  );
};
```

### Grid Layout Pattern

```typescript
// Responsive Grid Component
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  minChildWidth?: number;
}> = ({ children, minChildWidth = 300 }) => {
  return (
    <div 
      className="grid gap-4 sm:gap-6"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minChildWidth}px, 1fr))`
      }}
    >
      {children}
    </div>
  );
};

// Usage with explicit breakpoints
export const CardGrid: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
    {cards.map(card => (
      <Card key={card.id} {...card} />
    ))}
  </div>
);
```

### Table Responsiveness

```typescript
// Responsive Table Pattern
export const ResponsiveTable: React.FC<TableProps> = ({ columns, data }) => {
  const isMobile = useMediaQuery('(max-width: 639px)');
  
  if (isMobile) {
    // Card layout for mobile
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <Card key={index} padding="sm">
            {columns.map(column => (
              <div key={column.key} className="flex justify-between py-2">
                <span className="text-sm font-medium text-neutral-500">
                  {column.header}
                </span>
                <span className="text-sm text-neutral-900">
                  {column.render ? column.render(item[column.key], item) : item[column.key]}
                </span>
              </div>
            ))}
          </Card>
        ))}
      </div>
    );
  }
  
  // Regular table for larger screens
  return <Table columns={columns} data={data} />;
};

// Horizontal Scroll Pattern
export const ScrollableTable: React.FC<TableProps> = (props) => (
  <div className="overflow-x-auto -mx-4 sm:mx-0">
    <div className="inline-block min-w-full align-middle">
      <Table {...props} />
    </div>
  </div>
);
```

### Form Responsiveness

```typescript
// Responsive Form Layout
export const ResponsiveForm: React.FC = () => {
  return (
    <form className="space-y-6">
      {/* Single column on mobile, two columns on desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="First Name" name="firstName" />
        <Input label="Last Name" name="lastName" />
      </div>
      
      {/* Full width field */}
      <Input label="Email" name="email" type="email" />
      
      {/* Responsive button group */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <Button variant="outline" className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto">
          Save Changes
        </Button>
      </div>
    </form>
  );
};
```

### Modal Responsiveness

```typescript
// Responsive Modal Sizes
export const ResponsiveModal: React.FC<ModalProps> = ({ 
  size = 'md',
  fullScreenOnMobile = true,
  ...props 
}) => {
  const modalSizes = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    full: 'max-w-full'
  };
  
  return (
    <Modal
      {...props}
      className={clsx(
        'w-full',
        fullScreenOnMobile ? 'h-full sm:h-auto' : '',
        modalSizes[size]
      )}
    />
  );
};
```

## Touch Optimization

### Touch Target Sizes

```typescript
// Minimum touch target size: 44x44px (iOS) / 48x48px (Android)
export const TouchTarget: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}> = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={clsx(
      'min-h-[44px] min-w-[44px] flex items-center justify-center',
      'hover:bg-neutral-100 active:bg-neutral-200 transition-colors',
      className
    )}
  >
    {children}
  </button>
);

// Proper spacing for touch
export const TouchList: React.FC = () => (
  <ul className="divide-y divide-neutral-200">
    {items.map(item => (
      <li key={item.id}>
        <TouchTarget
          onClick={() => handleSelect(item)}
          className="w-full justify-start px-4 py-3"
        >
          <span>{item.name}</span>
          <ChevronRight className="ml-auto" size={20} />
        </TouchTarget>
      </li>
    ))}
  </ul>
);
```

### Gesture Support

```typescript
// Swipeable Component
export const SwipeableCard: React.FC<{
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  children: React.ReactNode;
}> = ({ onSwipeLeft, onSwipeRight, children }) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };
  
  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  );
};
```

## Typography Responsiveness

### Fluid Typography

```typescript
// Responsive text utilities
export const responsiveText = {
  // Fluid font sizes using clamp()
  'text-fluid-sm': 'text-[clamp(0.875rem,2vw,1rem)]',
  'text-fluid-base': 'text-[clamp(1rem,2.5vw,1.125rem)]',
  'text-fluid-lg': 'text-[clamp(1.125rem,3vw,1.5rem)]',
  'text-fluid-xl': 'text-[clamp(1.25rem,4vw,2rem)]',
  'text-fluid-2xl': 'text-[clamp(1.5rem,5vw,3rem)]',
};

// Responsive heading component
export const ResponsiveHeading: React.FC<{
  level: 'h1' | 'h2' | 'h3';
  children: React.ReactNode;
}> = ({ level, children }) => {
  const Component = level;
  
  const styles = {
    h1: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    h2: 'text-xl sm:text-2xl lg:text-3xl font-semibold',
    h3: 'text-lg sm:text-xl lg:text-2xl font-semibold'
  };
  
  return (
    <Component className={styles[level]}>
      {children}
    </Component>
  );
};
```

## Image Responsiveness

### Responsive Images

```typescript
// Responsive image component with srcset
export const ResponsiveImage: React.FC<{
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
}> = ({ src, alt, sizes, className }) => {
  const generateSrcSet = (baseSrc: string) => {
    const widths = [320, 640, 768, 1024, 1280, 1536];
    return widths
      .map(w => `${baseSrc}?w=${w} ${w}w`)
      .join(', ');
  };
  
  return (
    <img
      src={src}
      srcSet={generateSrcSet(src)}
      sizes={sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
      alt={alt}
      loading="lazy"
      className={clsx('w-full h-auto', className)}
    />
  );
};

// Aspect ratio container
export const AspectRatio: React.FC<{
  ratio: '1:1' | '4:3' | '16:9' | '21:9';
  children: React.ReactNode;
}> = ({ ratio, children }) => {
  const ratios = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '21:9': 'aspect-[21/9]'
  };
  
  return (
    <div className={clsx('relative overflow-hidden', ratios[ratio])}>
      {children}
    </div>
  );
};
```

## Performance Considerations

### Conditional Loading

```typescript
// Load heavy components only on desktop
export const ConditionalComponent: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  return (
    <>
      {/* Always visible */}
      <CoreContent />
      
      {/* Desktop only */}
      {isDesktop && (
        <Suspense fallback={<Skeleton />}>
          <HeavyDesktopComponent />
        </Suspense>
      )}
    </>
  );
};

// Progressive enhancement hook
export const useProgressiveEnhancement = () => {
  const [isEnhanced, setIsEnhanced] = useState(false);
  
  useEffect(() => {
    // Check for feature support
    const supportsEnhancement = 
      'IntersectionObserver' in window &&
      window.matchMedia('(min-width: 768px)').matches;
    
    setIsEnhanced(supportsEnhancement);
  }, []);
  
  return isEnhanced;
};
```

### Responsive Loading

```typescript
// Load different assets based on screen size
export const useResponsiveAsset = (
  mobileAsset: string,
  desktopAsset: string
) => {
  const [asset, setAsset] = useState(mobileAsset);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    
    const updateAsset = () => {
      setAsset(mediaQuery.matches ? desktopAsset : mobileAsset);
    };
    
    updateAsset();
    mediaQuery.addEventListener('change', updateAsset);
    
    return () => mediaQuery.removeEventListener('change', updateAsset);
  }, [mobileAsset, desktopAsset]);
  
  return asset;
};
```

## Testing Responsive Designs

### Breakpoint Testing

```typescript
// Test utilities for responsive components
export const testBreakpoints = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 }
];

// Cypress test example
describe('Responsive Navigation', () => {
  testBreakpoints.forEach(({ name, width, height }) => {
    it(`displays correctly on ${name}`, () => {
      cy.viewport(width, height);
      cy.visit('/');
      
      if (width < 768) {
        cy.get('[data-testid="mobile-menu"]').should('be.visible');
        cy.get('[data-testid="desktop-menu"]').should('not.be.visible');
      } else {
        cy.get('[data-testid="mobile-menu"]').should('not.be.visible');
        cy.get('[data-testid="desktop-menu"]').should('be.visible');
      }
    });
  });
});
```

## Responsive Utilities

### Custom Hooks

```typescript
// Media query hook
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    
    listener();
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
};

// Breakpoint hook
export const useBreakpoint = () => {
  const breakpoints = {
    sm: useMediaQuery('(min-width: 640px)'),
    md: useMediaQuery('(min-width: 768px)'),
    lg: useMediaQuery('(min-width: 1024px)'),
    xl: useMediaQuery('(min-width: 1280px)'),
    '2xl': useMediaQuery('(min-width: 1536px)')
  };
  
  return breakpoints;
};

// Viewport size hook
export const useViewportSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = debounce(() => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, 150);
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
};
```

## Best Practices

### Do's
1. Start with mobile layout and enhance
2. Use relative units (rem, %, vw/vh) over pixels
3. Test on real devices, not just browser devtools
4. Optimize touch targets for fingers
5. Consider bandwidth and performance on mobile
6. Use CSS Grid and Flexbox for layouts
7. Hide non-essential content on mobile
8. Test with dynamic viewport (iOS Safari)

### Don'ts
1. Don't use fixed widths that break layouts
2. Don't rely on hover states for functionality
3. Don't use tiny fonts on mobile
4. Don't forget about landscape orientation
5. Don't block pinch-to-zoom
6. Don't use desktop-only interactions
7. Don't load unnecessary resources on mobile
8. Don't assume fast connections