# Folder Structure Guide

## Overview
This document defines a scalable, feature-based folder structure for React/TypeScript applications. The structure prioritizes discoverability, maintainability, and clear separation of concerns.

## Root Structure

```
project-root/
├── src/                    # Source code
├── public/                 # Static assets
├── server/                 # Mock Express backend
├── tests/                  # Test configuration and e2e tests
├── .github/                # GitHub workflows
├── scripts/                # Build and utility scripts
├── docs/                   # Documentation
└── [config files]          # .env, package.json, tsconfig.json, etc.
```

## Frontend Structure (/src)

```
src/
├── api/                    # API layer
│   ├── client.ts          # Axios instance and interceptors
│   ├── endpoints/         # API endpoint definitions
│   │   ├── vessels.ts
│   │   ├── compliance.ts
│   │   ├── auth.ts
│   │   └── index.ts
│   └── types.ts           # API response types
│
├── assets/                # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── components/            # Shared components
│   ├── common/           # Basic UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── Table/
│   │
│   ├── forms/            # Form components
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── DatePicker/
│   │   └── FormField/
│   │
│   ├── layout/           # Layout components
│   │   ├── AppLayout/
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   └── Footer/
│   │
│   └── feedback/         # User feedback components
│       ├── Toast/
│       ├── Alert/
│       ├── Skeleton/
│       └── ErrorBoundary/
│
├── features/             # Feature modules
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── services/
│   │   │   └── authService.ts
│   │   └── types.ts
│   │
│   ├── vessels/
│   │   ├── components/
│   │   │   ├── VesselCard.tsx
│   │   │   ├── VesselTable.tsx
│   │   │   └── VesselFilters.tsx
│   │   ├── hooks/
│   │   │   ├── useVessels.ts
│   │   │   └── useVesselTracking.ts
│   │   ├── pages/
│   │   │   ├── VesselList.tsx
│   │   │   └── VesselDetail.tsx
│   │   └── types.ts
│   │
│   ├── compliance/
│   ├── fleet/
│   └── dashboard/
│
├── hooks/                # Global hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   └── useClickOutside.ts
│
├── pages/               # Route pages (thin wrappers)
│   ├── Dashboard.tsx
│   ├── VesselTracking.tsx
│   └── NotFound.tsx
│
├── routes/              # Routing configuration
│   ├── index.tsx
│   ├── ProtectedRoute.tsx
│   └── routes.ts
│
├── services/            # Business logic services
│   ├── analytics.ts
│   ├── storage.ts
│   └── validation.ts
│
├── stores/              # Zustand stores
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── index.ts
│
├── styles/              # Global styles
│   ├── globals.css      # Tailwind imports
│   └── components.css   # Custom component styles
│
├── types/               # Global TypeScript types
│   ├── global.d.ts
│   ├── models.ts
│   └── utils.ts
│
├── utils/               # Utility functions
│   ├── constants.ts
│   ├── formatters.ts
│   ├── validators.ts
│   └── helpers.ts
│
├── App.tsx              # Root component
├── main.tsx            # Entry point
└── vite-env.d.ts       # Vite types
```

## Backend Structure (/server)

```
server/
├── src/
│   ├── routes/          # Express routes
│   │   ├── vessels.ts
│   │   ├── compliance.ts
│   │   ├── auth.ts
│   │   └── index.ts
│   │
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts
│   │   ├── cors.ts
│   │   └── errorHandler.ts
│   │
│   ├── data/           # Mock data fixtures
│   │   ├── vessels.json
│   │   ├── users.json
│   │   └── compliance.json
│   │
│   ├── utils/          # Server utilities
│   │   ├── responses.ts
│   │   └── generators.ts
│   │
│   ├── types/          # Server types
│   │   └── index.ts
│   │
│   └── index.ts        # Server entry point
│
├── package.json
└── tsconfig.json
```

## File Naming Conventions

### Components
- **React Components**: PascalCase (e.g., `VesselCard.tsx`)
- **Component Folders**: PascalCase matching component name
- **Index Files**: Always `index.ts` for exports

### Non-Components
- **Hooks**: camelCase with 'use' prefix (e.g., `useVessels.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: camelCase or SCREAMING_SNAKE_CASE
- **Types**: PascalCase for interfaces/types

### Test Files
- **Unit Tests**: `ComponentName.test.tsx`
- **Integration Tests**: `feature.integration.test.ts`
- **E2E Tests**: `user-flow.e2e.test.ts`

## Feature Module Structure

Each feature module should be self-contained:

```
features/vessels/
├── components/          # Feature-specific components
├── hooks/              # Feature-specific hooks
├── pages/              # Feature pages/routes
├── services/           # Feature API services
├── utils/              # Feature utilities
├── types.ts            # Feature types
└── index.ts            # Public exports
```

## Import Organization

### Import Order (enforced by ESLint)
1. React imports
2. Third-party imports
3. Absolute imports (from src/)
4. Relative imports
5. Style imports

### Path Aliases (tsconfig.json)
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@features/*": ["./src/features/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@utils/*": ["./src/utils/*"],
      "@api/*": ["./src/api/*"],
      "@types/*": ["./src/types/*"]
    }
  }
}
```

## Component Organization Rules

### Component File Structure
```typescript
// 1. Imports
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/common';
import { useVessels } from '../hooks/useVessels';
import type { Vessel } from '../types';

// 2. Types/Interfaces
interface VesselCardProps {
  vessel: Vessel;
  onSelect: (id: string) => void;
}

// 3. Component
export const VesselCard: React.FC<VesselCardProps> = ({ vessel, onSelect }) => {
  // 4. Hooks
  const navigate = useNavigate();
  
  // 5. State
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 6. Handlers
  const handleClick = useCallback(() => {
    onSelect(vessel.id);
  }, [vessel.id, onSelect]);
  
  // 7. Render
  return (
    <div className="vessel-card">
      {/* Component JSX */}
    </div>
  );
};

// 8. Default export (if needed)
export default VesselCard;
```

## Scalability Guidelines

### When to Create a New Feature Module
- The feature has 3+ components
- The feature has specific business logic
- The feature has dedicated routes
- The feature may be removed/replaced independently

### When to Add to Common Components
- Used in 3+ different features
- No feature-specific logic
- Could be used in any project
- Follows common UI patterns

### When to Extract to Utils
- Pure functions with no side effects
- Used across multiple features
- Not React-specific
- Could be unit tested independently

## Build Output Structure

```
dist/
├── assets/             # Hashed static assets
│   ├── js/
│   ├── css/
│   └── images/
├── index.html          # Entry HTML
└── [other static files]
```

## Environment-Specific Files

```
.env                    # Default/development
.env.local             # Local overrides (gitignored)
.env.production        # Production values
.env.test              # Test environment
```

## Best Practices

1. **One Component Per File** - Except for tightly coupled sub-components
2. **Index Exports** - Use index.ts for cleaner imports
3. **Colocation** - Keep related files together
4. **Lazy Boundaries** - Code split at the feature level
5. **Type Safety** - Types defined close to usage
6. **Test Proximity** - Tests next to implementation
7. **No Circular Dependencies** - Enforced by ESLint
8. **Clear Public APIs** - Features export only what's needed