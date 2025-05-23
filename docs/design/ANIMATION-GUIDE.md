# Animation Guide

## Overview
This document defines animation patterns, transitions, and micro-interactions that enhance user experience while maintaining performance and accessibility. All animations should be purposeful, subtle, and respect user preferences.

## Animation Principles

### Core Values
1. **Purpose Over Polish** - Every animation should have a clear UX purpose
2. **Performance First** - Animations must not degrade performance
3. **Accessibility** - Respect prefers-reduced-motion settings
4. **Consistency** - Use consistent timing and easing functions
5. **Subtlety** - Less is more; avoid overwhelming users

### Animation Types
```typescript
// Animation categories and their purposes
export const animationPurposes = {
  feedback: 'Confirm user actions (clicks, hovers, form submissions)',
  guidance: 'Direct attention and show relationships',
  state: 'Communicate changes between states',
  personality: 'Add delight and brand character (use sparingly)',
  loading: 'Indicate progress and reduce perceived wait time'
};
```

## Timing and Easing

### Duration Scale
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',    // Micro interactions (hover states)
        '100': '100ms',  // Quick feedback
        '150': '150ms',  // Default transitions
        '200': '200ms',  // Standard animations
        '300': '300ms',  // Complex transitions
        '500': '500ms',  // Page transitions
        '700': '700ms',  // Elaborate animations
        '1000': '1000ms' // Very slow animations
      }
    }
  }
}
```

### Easing Functions
```typescript
// Custom easing functions
export const easings = {
  // Standard easings
  ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
  
  // Custom easings
  easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // Spring-like
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};
```

## Micro-interactions

### Hover Effects

```typescript
// Button hover animation
export const AnimatedButton: React.FC<ButtonProps> = (props) => {
  return (
    <button
      className={clsx(
        'relative overflow-hidden transition-all duration-200',
        'hover:scale-105 hover:shadow-md',
        'active:scale-95 active:shadow-sm'
      )}
      {...props}
    >
      {/* Ripple effect on click */}
      <span className="absolute inset-0 bg-white/20 scale-0 rounded-full transition-transform duration-500" />
      {props.children}
    </button>
  );
};

// Card hover animation
export const HoverCard: React.FC<CardProps> = ({ children, ...props }) => {
  return (
    <div
      className={clsx(
        'group relative transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1'
      )}
      {...props}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
      {children}
    </div>
  );
};
```

### Focus Animations

```typescript
// Animated focus ring
export const AnimatedFocusRing: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative">
      {children}
      <div 
        className={clsx(
          'absolute inset-0 rounded-md pointer-events-none',
          'ring-2 ring-primary-500 ring-opacity-0',
          'focus-within:ring-opacity-100 focus-within:animate-pulse',
          'transition-all duration-200'
        )}
      />
    </div>
  );
};
```

### Loading Animations

```typescript
// Spinner animation
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <svg
      className={clsx('animate-spin text-primary-500', sizes[size])}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Progress bar animation
export const AnimatedProgress: React.FC<{ value: number }> = ({ value }) => {
  return (
    <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${value}%` }}
      >
        {/* Shimmer effect */}
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
      </div>
    </div>
  );
};
```

## Skeleton Screens

### Shimmer Animation

```css
/* globals.css */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
```

### Skeleton Components

```typescript
// Base skeleton with shimmer
export const Skeleton: React.FC<{
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}> = ({ className, variant = 'rectangular', width, height }) => {
  const baseStyles = 'bg-neutral-200 relative overflow-hidden';
  
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  };
  
  return (
    <div
      className={clsx(baseStyles, variants[variant], className)}
      style={{ width, height }}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
    </div>
  );
};

// Complex skeleton layouts
export const CardSkeleton: React.FC = () => (
  <Card>
    <div className="animate-pulse">
      <Skeleton height={200} className="mb-4" />
      <Skeleton variant="text" width="60%" height={20} className="mb-2" />
      <Skeleton variant="text" width="40%" height={16} className="mb-4" />
      <div className="flex gap-2">
        <Skeleton width={80} height={32} />
        <Skeleton width={80} height={32} />
      </div>
    </div>
  </Card>
);

export const TableRowSkeleton: React.FC<{ columns: number }> = ({ columns }) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton variant="text" width="80%" height={16} />
      </td>
    ))}
  </tr>
);
```

## Page Transitions

### Route Transitions

```typescript
// Fade transition wrapper
export const FadeTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// Slide transition wrapper
export const SlideTransition: React.FC<{ 
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
}> = ({ children, direction = 'right' }) => {
  const variants = {
    initial: {
      left: { x: -20 },
      right: { x: 20 },
      up: { y: -20 },
      down: { y: 20 }
    }
  };
  
  return (
    <motion.div
      initial={{ ...variants.initial[direction], opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={{ ...variants.initial[direction], opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};
```

### Stagger Animations

```typescript
// List item stagger animation
export const StaggerList: React.FC<{ items: any[] }> = ({ items }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };
  
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      {items.map((item, index) => (
        <motion.li key={index} variants={itemVariants}>
          <ListItem {...item} />
        </motion.li>
      ))}
    </motion.ul>
  );
};
```

## Modal and Overlay Animations

### Modal Entrance

```typescript
export const AnimatedModal: React.FC<ModalProps> = ({ isOpen, children, ...props }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

### Dropdown Animation

```typescript
export const AnimatedDropdown: React.FC<{
  isOpen: boolean;
  children: React.ReactNode;
}> = ({ isOpen, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute top-full mt-2 w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

## Notification Animations

### Toast Animation

```typescript
export const AnimatedToast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="pointer-events-auto"
    >
      <Toast message={message} type={type} onClose={onClose} />
    </motion.div>
  );
};

// Toast container with stagger
export const ToastContainer: React.FC<{ toasts: Toast[] }> = ({ toasts }) => {
  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-2 z-50">
      <AnimatePresence>
        {toasts.map((toast) => (
          <AnimatedToast key={toast.id} {...toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
```

## Scroll Animations

### Reveal on Scroll

```typescript
export const ScrollReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Parallax scroll effect
export const ParallaxSection: React.FC<{
  children: React.ReactNode;
  offset?: number;
}> = ({ children, offset = 50 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  
  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
};
```

## Gesture Animations

### Drag to Dismiss

```typescript
export const DraggableCard: React.FC<{
  onDismiss: () => void;
  children: React.ReactNode;
}> = ({ onDismiss, children }) => {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, { offset, velocity }) => {
        if (Math.abs(offset.x) > 200 || Math.abs(velocity.x) > 500) {
          onDismiss();
        }
      }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="cursor-grab active:cursor-grabbing"
    >
      {children}
    </motion.div>
  );
};
```

## Performance Optimization

### GPU Acceleration

```typescript
// Use transform and opacity for smooth animations
export const optimizedAnimations = {
  // Good - uses GPU-accelerated properties
  fadeIn: {
    initial: { opacity: 0, transform: 'translateY(20px)' },
    animate: { opacity: 1, transform: 'translateY(0px)' }
  },
  
  // Bad - triggers layout recalculation
  badFadeIn: {
    initial: { opacity: 0, marginTop: '20px' },
    animate: { opacity: 1, marginTop: '0px' }
  }
};

// will-change optimization
export const OptimizedComponent: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  return (
    <div
      className="transition-transform duration-300"
      style={{ willChange: isAnimating ? 'transform' : 'auto' }}
      onMouseEnter={() => setIsAnimating(true)}
      onMouseLeave={() => setIsAnimating(false)}
    >
      {/* Content */}
    </div>
  );
};
```

### Reduced Motion

```typescript
// Respect user preferences
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);
  
  return prefersReducedMotion;
};

// Motion-safe wrapper
export const MotionSafe: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) {
    return <>{fallback || children}</>;
  }
  
  return <>{children}</>;
};
```

## Animation Utilities

### Custom Hooks

```typescript
// Animation state machine
export const useAnimationState = (states: string[]) => {
  const [currentState, setCurrentState] = useState(states[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const transitionTo = useCallback((newState: string) => {
    if (states.includes(newState) && newState !== currentState) {
      setIsAnimating(true);
      setCurrentState(newState);
      
      // Reset after animation
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [currentState, states]);
  
  return { currentState, isAnimating, transitionTo };
};

// Spring physics
export const useSpring = (value: number, config = {}) => {
  const [spring, setSpring] = useState(value);
  
  useEffect(() => {
    const tension = config.tension || 170;
    const friction = config.friction || 26;
    
    // Simplified spring physics
    let velocity = 0;
    let current = spring;
    
    const animate = () => {
      const force = (value - current) * tension / 1000;
      velocity += force;
      velocity *= friction / 30;
      current += velocity;
      
      if (Math.abs(value - current) < 0.001) {
        setSpring(value);
        return;
      }
      
      setSpring(current);
      requestAnimationFrame(animate);
    };
    
    animate();
  }, [value, config.tension, config.friction]);
  
  return spring;
};
```

## Best Practices

### Do's
1. Use CSS transitions for simple state changes
2. Implement spring physics for natural motion
3. Keep animations under 300ms for responsiveness
4. Use transform and opacity for performance
5. Test on low-end devices
6. Provide immediate visual feedback
7. Use easing functions that match your brand
8. Consider cumulative layout shift (CLS)

### Don'ts
1. Don't animate height/width (use transform: scale)
2. Don't overuse animations
3. Don't animate during page load
4. Don't use linear easing (looks mechanical)
5. Don't forget prefers-reduced-motion
6. Don't animate multiple properties simultaneously
7. Don't use animations to hide poor UX
8. Don't create animations longer than 1 second