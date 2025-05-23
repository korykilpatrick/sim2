# State Patterns Guide

## Overview
This document defines patterns for managing state in React applications, covering when to use local vs global state, form handling, data fetching, and state synchronization. These patterns ensure predictable state management and optimal performance.

## State Categories

### State Type Decision Tree
```typescript
/*
1. Is it server data? → React Query
2. Is it form data? → React Hook Form / Local State
3. Is it shared across routes? → Zustand
4. Is it UI state for one component? → Local State
5. Is it derived from other state? → Computed/Memoized
*/

// Examples of each category:
type StateCategories = {
  serverState: 'API responses, user data, vessel lists';        // React Query
  formState: 'Input values, validation, submission status';     // React Hook Form
  globalUIState: 'Theme, sidebar, modals, notifications';       // Zustand
  localUIState: 'Dropdowns, toggles, hover states';            // useState
  routeState: 'Filters, pagination, search params';            // URL params
  derivedState: 'Filtered lists, calculations, formatting';     // useMemo
};
```

## Local State Patterns

### Basic Component State
```typescript
// ✅ Correct: Simple, isolated UI state
export const VesselCard: React.FC<{ vessel: Vessel }> = ({ vessel }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
      {isExpanded && <VesselDetails vessel={vessel} />}
    </div>
  );
};

// ❌ Incorrect: Don't use local state for shared data
export const BadExample: React.FC = () => {
  // This should be in global state or lifted up
  const [user, setUser] = useState<User | null>(null);
  const [vessels, setVessels] = useState<Vessel[]>([]);
};
```

### State Initialization Patterns
```typescript
// Lazy initial state for expensive operations
const ExpensiveComponent: React.FC = () => {
  // ✅ Function runs only once
  const [data, setData] = useState(() => {
    return computeExpensiveInitialData();
  });
  
  // ❌ Function runs every render
  const [badData, setBadData] = useState(computeExpensiveInitialData());
};

// State from props with synchronization
const EditableField: React.FC<{ initialValue: string }> = ({ initialValue }) => {
  const [value, setValue] = useState(initialValue);
  
  // Sync with prop changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
};
```

### Complex Local State
```typescript
// useReducer for complex state logic
interface FilterState {
  search: string;
  status: VesselStatus[];
  riskLevel: RiskLevel[];
  dateRange: { start: Date | null; end: Date | null };
}

type FilterAction =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'TOGGLE_STATUS'; payload: VesselStatus }
  | { type: 'SET_DATE_RANGE'; payload: { start: Date; end: Date } }
  | { type: 'RESET' };

const filterReducer = (state: FilterState, action: FilterAction): FilterState => {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
    
    case 'TOGGLE_STATUS':
      const hasStatus = state.status.includes(action.payload);
      return {
        ...state,
        status: hasStatus
          ? state.status.filter(s => s !== action.payload)
          : [...state.status, action.payload]
      };
    
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    
    case 'RESET':
      return initialFilterState;
    
    default:
      return state;
  }
};

export const VesselFilters: React.FC = () => {
  const [filters, dispatch] = useReducer(filterReducer, initialFilterState);
  
  return (
    <div>
      <input
        value={filters.search}
        onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
      />
      {/* Other filter controls */}
    </div>
  );
};
```

## Global State Patterns (Zustand)

### Store Organization
```typescript
// stores/authStore.ts
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  // Actions
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { user, token } = await authApi.login(credentials);
      localStorage.setItem('token', token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
  
  refreshToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      const { user, newToken } = await authApi.refresh(token);
      localStorage.setItem('token', newToken);
      set({ user, isAuthenticated: true });
    } catch {
      get().logout();
    }
  },
  
  updateProfile: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null
    }));
  }
}));
```

### Sliced Pattern for Large Stores
```typescript
// stores/slices/createUISlice.ts
export interface UISlice {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Modals
  activeModal: string | null;
  modalData: any;
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  // Modals
  activeModal: null,
  modalData: null,
  openModal: (modalId, data) => set({ activeModal: modalId, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
  
  // Theme
  theme: 'light',
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  }))
});

// stores/index.ts - Combine slices
import { create } from 'zustand';
import { createUISlice, UISlice } from './slices/createUISlice';
import { createUserSlice, UserSlice } from './slices/createUserSlice';

type StoreState = UISlice & UserSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createUISlice(...a),
  ...createUserSlice(...a)
}));
```

### Subscriptions and Selectors
```typescript
// Efficient selectors to prevent unnecessary re-renders
export const useVesselStore = create<VesselState>()((set) => ({
  vessels: [],
  filters: {},
  selectedId: null,
  // ... actions
}));

// Component using specific slice
const VesselList: React.FC = () => {
  // ✅ Only re-renders when vessels change
  const vessels = useVesselStore((state) => state.vessels);
  
  // ❌ Re-renders on any state change
  const state = useVesselStore();
  
  // ✅ Multiple selections with shallow equality
  const { filters, selectedId } = useVesselStore(
    (state) => ({ filters: state.filters, selectedId: state.selectedId }),
    shallow
  );
};

// Computed selectors
const useFilteredVessels = () => {
  return useVesselStore((state) => {
    const { vessels, filters } = state;
    return vessels.filter(vessel => {
      if (filters.search && !vessel.name.includes(filters.search)) return false;
      if (filters.status && vessel.status !== filters.status) return false;
      return true;
    });
  });
};
```

## Server State Patterns (React Query)

### Query Patterns
```typescript
// hooks/useVessels.ts
export const useVessels = (filters?: VesselFilters) => {
  return useQuery({
    queryKey: ['vessels', filters],
    queryFn: () => vesselApi.getVessels(filters),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Dependent queries
export const useVesselDetails = (vesselId: string | null) => {
  return useQuery({
    queryKey: ['vessel', vesselId],
    queryFn: () => vesselApi.getVessel(vesselId!),
    enabled: !!vesselId, // Only run if vesselId exists
  });
};

// Parallel queries
export const useVesselDashboard = () => {
  const results = useQueries({
    queries: [
      {
        queryKey: ['vessels', 'active'],
        queryFn: () => vesselApi.getActiveVessels(),
      },
      {
        queryKey: ['vessels', 'high-risk'],
        queryFn: () => vesselApi.getHighRiskVessels(),
      },
      {
        queryKey: ['tracking', 'active'],
        queryFn: () => trackingApi.getActiveTrackings(),
      }
    ]
  });
  
  return {
    activeVessels: results[0].data,
    highRiskVessels: results[1].data,
    activeTrackings: results[2].data,
    isLoading: results.some(r => r.isLoading),
    isError: results.some(r => r.isError)
  };
};
```

### Mutation Patterns
```typescript
// hooks/useCreateTracking.ts
export const useCreateTracking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTrackingRequest) => trackingApi.create(data),
    
    // Optimistic update
    onMutate: async (newTracking) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ['trackings'] });
      
      // Snapshot previous value
      const previousTrackings = queryClient.getQueryData(['trackings']);
      
      // Optimistically update
      queryClient.setQueryData(['trackings'], (old: Tracking[]) => [
        ...old,
        { ...newTracking, id: 'temp-id', status: 'pending' }
      ]);
      
      return { previousTrackings };
    },
    
    // Handle error - rollback
    onError: (err, newTracking, context) => {
      queryClient.setQueryData(['trackings'], context?.previousTrackings);
      toast.error('Failed to create tracking');
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackings'] });
    },
    
    onSuccess: (data) => {
      toast.success('Tracking created successfully');
      // Update specific cache entries
      queryClient.setQueryData(['tracking', data.id], data);
    }
  });
};

// Usage in component
const TrackingForm: React.FC = () => {
  const createTracking = useCreateTracking();
  
  const handleSubmit = async (data: CreateTrackingRequest) => {
    try {
      await createTracking.mutateAsync(data);
      // Navigate on success
      navigate('/trackings');
    } catch (error) {
      // Error handled in mutation
    }
  };
};
```

### Cache Management
```typescript
// Prefetching
export const useVesselPrefetch = () => {
  const queryClient = useQueryClient();
  
  const prefetchVessel = (vesselId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['vessel', vesselId],
      queryFn: () => vesselApi.getVessel(vesselId),
      staleTime: 10 * 60 * 1000,
    });
  };
  
  return { prefetchVessel };
};

// Manual cache updates
export const useUpdateVesselCache = () => {
  const queryClient = useQueryClient();
  
  const updateVessel = (vesselId: string, updates: Partial<Vessel>) => {
    queryClient.setQueryData(['vessel', vesselId], (old: Vessel) => ({
      ...old,
      ...updates
    }));
    
    // Also update in list
    queryClient.setQueryData(['vessels'], (old: Vessel[]) => 
      old.map(v => v.id === vesselId ? { ...v, ...updates } : v)
    );
  };
  
  return { updateVessel };
};
```

## Form State Patterns

### React Hook Form
```typescript
// schemas/vesselTrackingSchema.ts
import { z } from 'zod';

export const vesselTrackingSchema = z.object({
  vesselId: z.string().min(1, 'Vessel is required'),
  duration: z.number().min(1).max(365),
  criteria: z.array(z.string()).min(1, 'Select at least one criterion'),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean().optional(),
    webhook: z.string().url().optional().or(z.literal(''))
  })
});

export type VesselTrackingForm = z.infer<typeof vesselTrackingSchema>;

// components/TrackingForm.tsx
export const TrackingForm: React.FC = () => {
  const createTracking = useCreateTracking();
  
  const form = useForm<VesselTrackingForm>({
    resolver: zodResolver(vesselTrackingSchema),
    defaultValues: {
      duration: 30,
      criteria: [],
      notifications: {
        email: true,
        sms: false,
        webhook: ''
      }
    }
  });
  
  const onSubmit = async (data: VesselTrackingForm) => {
    await createTracking.mutateAsync(data);
  };
  
  // Watch specific fields
  const duration = form.watch('duration');
  const estimatedCost = calculateCost(duration);
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="vesselId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vessel</FormLabel>
              <FormControl>
                <VesselSelect {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (days)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>
                Estimated cost: {estimatedCost} credits
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Creating...' : 'Create Tracking'}
        </Button>
      </form>
    </Form>
  );
};
```

### Complex Form Patterns
```typescript
// Multi-step form with persistence
export const MultiStepForm: React.FC = () => {
  const [step, setStep] = useState(1);
  
  const form = useForm({
    defaultValues: {
      // Load from localStorage if exists
      ...JSON.parse(localStorage.getItem('draft-form') || '{}')
    }
  });
  
  // Auto-save draft
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem('draft-form', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
  const nextStep = async () => {
    const fields = getFieldsForStep(step);
    const isValid = await form.trigger(fields);
    
    if (isValid) {
      setStep(step + 1);
    }
  };
  
  const onSubmit = async (data: FormData) => {
    // Clear draft on successful submission
    localStorage.removeItem('draft-form');
    await submitForm(data);
  };
};

// Dynamic form fields
export const DynamicFieldArray: React.FC = () => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'criteria'
  });
  
  return (
    <div>
      {fields.map((field, index) => (
        <div key={field.id}>
          <Input
            {...form.register(`criteria.${index}.value`)}
            placeholder="Enter criterion"
          />
          <Button onClick={() => remove(index)}>Remove</Button>
        </div>
      ))}
      <Button onClick={() => append({ value: '' })}>Add Criterion</Button>
    </div>
  );
};
```

## URL State Patterns

### Search Params as State
```typescript
// hooks/useSearchParamsState.ts
export const useSearchParamsState = <T extends Record<string, any>>(
  defaultValues: T
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const state = useMemo(() => {
    const params: any = {};
    
    // Parse URL params
    for (const [key, value] of searchParams.entries()) {
      if (value === 'true') params[key] = true;
      else if (value === 'false') params[key] = false;
      else if (!isNaN(Number(value))) params[key] = Number(value);
      else params[key] = value;
    }
    
    return { ...defaultValues, ...params } as T;
  }, [searchParams, defaultValues]);
  
  const setState = useCallback((updates: Partial<T>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === defaultValues[key]) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    
    setSearchParams(newParams);
  }, [searchParams, setSearchParams, defaultValues]);
  
  return [state, setState] as const;
};

// Usage
const VesselListPage: React.FC = () => {
  const [filters, setFilters] = useSearchParamsState({
    page: 1,
    search: '',
    status: 'all',
    sortBy: 'name'
  });
  
  const { data } = useVessels(filters);
  
  return (
    <div>
      <Input
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
      />
      {/* Rest of component */}
    </div>
  );
};
```

## State Synchronization

### Local + Server State Sync
```typescript
// Syncing optimistic updates with server state
export const useOptimisticToggle = (
  id: string,
  serverToggle: (id: string) => Promise<void>
) => {
  const [isOptimistic, setIsOptimistic] = useState(false);
  const [localValue, setLocalValue] = useState<boolean | null>(null);
  
  const toggle = async (currentValue: boolean) => {
    // Set optimistic value
    setLocalValue(!currentValue);
    setIsOptimistic(true);
    
    try {
      await serverToggle(id);
      // Server update will trigger re-fetch
    } catch (error) {
      // Revert on error
      setLocalValue(null);
      toast.error('Failed to update');
    } finally {
      setIsOptimistic(false);
    }
  };
  
  return { localValue, isOptimistic, toggle };
};
```

### Cross-Tab State Sync
```typescript
// Sync state across browser tabs
export const useCrossTabState = <T>(key: string, initialValue: T) => {
  const [state, setState] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setState(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);
  
  const updateState = useCallback((value: T) => {
    setState(value);
    localStorage.setItem(key, JSON.stringify(value));
    
    // Notify other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key,
      newValue: JSON.stringify(value)
    }));
  }, [key]);
  
  return [state, updateState] as const;
};
```

## Performance Patterns

### State Optimization
```typescript
// Prevent unnecessary re-renders
export const OptimizedComponent: React.FC = () => {
  // ✅ Split state that changes independently
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // ❌ Don't combine unrelated state
  const [state, setState] = useState({
    search: '',
    isLoading: false,
    user: null,
    theme: 'light'
  });
  
  // ✅ Use memo for expensive computations
  const filteredItems = useMemo(() => 
    items.filter(item => item.name.includes(search)),
    [items, search]
  );
  
  // ✅ Use callback for stable references
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);
};

// State batching
export const BatchedUpdates: React.FC = () => {
  const handleMultipleUpdates = () => {
    // React 18 automatically batches these
    setCount(c => c + 1);
    setFlag(f => !f);
    setText('updated');
  };
};
```

## Testing State

### Testing Hooks
```typescript
// __tests__/useVessels.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useVessels', () => {
  it('should fetch vessels', async () => {
    const { result } = renderHook(() => useVessels(), {
      wrapper: createWrapper()
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toHaveLength(10);
  });
});

// Testing Zustand stores
describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });
  
  it('should login user', async () => {
    const { login } = useAuthStore.getState();
    
    await login({ email: 'test@example.com', password: 'password' });
    
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toBeDefined();
  });
});
```

## Best Practices

### State Management Rules
1. **Server State**: Always use React Query, never store in Zustand
2. **Form State**: Use React Hook Form for complex forms, controlled components for simple inputs
3. **UI State**: Local for component-specific, global for shared across routes
4. **URL State**: Use for user-shareable state (filters, pagination)
5. **Derived State**: Calculate on render, memoize if expensive

### Anti-Patterns to Avoid
```typescript
// ❌ Don't sync server state to local state
const BadComponent = () => {
  const { data } = useQuery(['vessels'], fetchVessels);
  const [vessels, setVessels] = useState(data || []); // Don't do this!
  
  useEffect(() => {
    if (data) setVessels(data); // Unnecessary sync
  }, [data]);
};

// ❌ Don't store derived state
const BadDerivedState = ({ items }) => {
  const [filteredItems, setFilteredItems] = useState([]); // Don't store
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    setFilteredItems(items.filter(i => i.includes(search))); // Calculate instead
  }, [items, search]);
};

// ❌ Don't create multiple stores for related data
const badVesselStore = create(() => ({ vessels: [] }));
const badFilterStore = create(() => ({ filters: {} })); // Keep together

// ❌ Don't mutate state directly
const BadMutation = () => {
  const { user } = useAuthStore();
  user.name = 'New Name'; // Never mutate directly!
};
```