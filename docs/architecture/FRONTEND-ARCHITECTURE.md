# Frontend Architecture Guide

## Overview
This document outlines the architectural decisions for building a production-grade React/TypeScript application with a focus on scalability, maintainability, and developer experience.

## Tech Stack

### Core Technologies
- **React 18+** - UI library with concurrent features
- **TypeScript 4.9+** - Type safety and better DX
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Express** - Mock API backend

### State Management
- **Zustand** - Lightweight state management for global state
- **React Query (TanStack Query)** - Server state management
- **React Hook Form** - Form state management

### Additional Libraries
- **Axios** - HTTP client with interceptors
- **date-fns** - Date manipulation
- **clsx** - Conditional className utility
- **react-hot-toast** - Toast notifications
- **recharts** - Data visualization

## Component Architecture

### Component Categories

```
1. Layout Components
   └── AppLayout, DashboardLayout, AuthLayout

2. Feature Components
   └── VesselTracker, ComplianceReport, FleetMonitor

3. UI Components
   └── Button, Card, Modal, Table, Form elements

4. Utility Components
   └── ErrorBoundary, ProtectedRoute, LazyLoad
```

### Component Principles
- **Single Responsibility** - Each component has one clear purpose
- **Composition over Inheritance** - Build complex UIs from simple parts
- **Props Interface** - All components have TypeScript interfaces
- **Controlled vs Uncontrolled** - Prefer controlled components

### Component Structure
```typescript
// components/features/VesselTracking/VesselTrackingCard.tsx
interface VesselTrackingCardProps {
  vessel: Vessel;
  onTrack: (id: string) => void;
  isLoading?: boolean;
}

export const VesselTrackingCard: React.FC<VesselTrackingCardProps> = ({
  vessel,
  onTrack,
  isLoading = false
}) => {
  // Component logic
};
```

## State Management Strategy

### State Categories

1. **Server State** (React Query)
   - API responses
   - Cached data
   - Background refetching

2. **Client State** (Zustand)
   - User preferences
   - UI state (modals, sidebars)
   - Authentication state

3. **Form State** (React Hook Form)
   - Form values
   - Validation errors
   - Submission status

4. **URL State** (React Router)
   - Current route
   - Query parameters
   - Route params

### Zustand Store Structure
```typescript
// stores/useAuthStore.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}
```

### React Query Patterns
```typescript
// hooks/useVessels.ts
export const useVessels = (filters?: VesselFilters) => {
  return useQuery({
    queryKey: ['vessels', filters],
    queryFn: () => vesselApi.getVessels(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

## Routing Strategy

### Route Structure
```typescript
// routes/index.tsx
const routes = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'vessels', element: <VesselTracking /> },
      { path: 'vessels/:id', element: <VesselDetail /> },
      { path: 'compliance', element: <ComplianceReports /> },
      { path: 'fleet', element: <FleetMonitoring /> },
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ]
  }
];
```

### Protected Routes
```typescript
// components/auth/ProtectedRoute.tsx
export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};
```

## Data Fetching Patterns

### API Layer
```typescript
// api/client.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Error Handling
```typescript
// utils/errorHandler.ts
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || 'An error occurred';
  }
  return 'An unexpected error occurred';
};
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy load feature modules
const VesselTracking = lazy(() => import('./features/VesselTracking'));
const ComplianceReports = lazy(() => import('./features/ComplianceReports'));
```

### Memoization Strategy
- Use `React.memo` for expensive list items
- Use `useMemo` for expensive computations
- Use `useCallback` for stable function references

### Bundle Optimization
- Tree shaking with ES modules
- Dynamic imports for large libraries
- Optimize images with next-gen formats

## Testing Strategy

### Testing Layers
1. **Unit Tests** - Components, hooks, utilities
2. **Integration Tests** - Feature flows
3. **E2E Tests** - Critical user paths

### Testing Tools
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **MSW** - API mocking
- **Playwright** - E2E testing

## Security Considerations

### Frontend Security
- XSS prevention with React's default escaping
- CSRF tokens for state-changing operations
- Content Security Policy headers
- Secure storage for sensitive data

### Authentication Flow
1. User submits credentials
2. Backend validates and returns JWT
3. Frontend stores token securely
4. Token included in API requests
5. Token refresh before expiration

## Development Workflow

### Branch Strategy
- `main` - Production ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `hotfix/*` - Emergency fixes

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- Husky for pre-commit hooks
- TypeScript strict mode

## Deployment Considerations

### Environment Variables
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Maritime Intelligence
VITE_ENABLE_MOCK=true
```

### Build Optimization
- Minification and compression
- Asset optimization
- Lazy loading
- CDN deployment for static assets