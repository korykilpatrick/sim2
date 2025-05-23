# Data Flow Guide

## Overview
This document describes how data flows through the application, from API requests to UI updates. Understanding these patterns ensures consistent data handling and predictable application behavior.

## Data Flow Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────┐
│   Express   │────▶│ React Query  │────▶│    Zustand   │────▶│    React   │
│  Mock API   │     │    Cache     │     │    Stores    │     │ Components │
└─────────────┘     └──────────────┘     └──────────────┘     └────────────┘
       ▲                    │                     │                    │
       │                    ▼                     ▼                    ▼
       │            ┌──────────────┐     ┌──────────────┐     ┌────────────┐
       └────────────│   Mutations  │     │ Local State  │     │  User UI   │
                    └──────────────┘     └──────────────┘     └────────────┘
```

## Layer Responsibilities

### 1. API Layer (Express Mock)
- Serves mock data
- Simulates real API behavior
- Handles CRUD operations
- Returns appropriate status codes

### 2. HTTP Client (Axios)
- Makes HTTP requests
- Handles authentication headers
- Transforms requests/responses
- Manages errors consistently

### 3. Server State (React Query)
- Caches API responses
- Manages loading/error states
- Handles background refetching
- Optimistic updates

### 4. Client State (Zustand)
- UI state (modals, sidebars)
- User preferences
- Authentication state
- Non-server data

### 5. Component State (React)
- Form inputs
- UI interactions
- Temporary states
- Derived data

## Data Flow Patterns

### Pattern 1: Fetching Data

```typescript
// 1. API Endpoint Definition
// api/endpoints/vessels.ts
export const vesselApi = {
  getVessels: async (params?: VesselParams): Promise<VesselResponse> => {
    const { data } = await apiClient.get('/vessels', { params });
    return data;
  },
  
  getVessel: async (id: string): Promise<Vessel> => {
    const { data } = await apiClient.get(`/vessels/${id}`);
    return data;
  }
};

// 2. React Query Hook
// features/vessels/hooks/useVessels.ts
export const useVessels = (params?: VesselParams) => {
  return useQuery({
    queryKey: ['vessels', params],
    queryFn: () => vesselApi.getVessels(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// 3. Component Usage
// features/vessels/components/VesselList.tsx
export const VesselList: React.FC = () => {
  const { data, isLoading, error } = useVessels();
  
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className="vessel-list">
      {data?.vessels.map(vessel => (
        <VesselCard key={vessel.id} vessel={vessel} />
      ))}
    </div>
  );
};
```

### Pattern 2: Mutating Data

```typescript
// 1. API Mutation Endpoint
// api/endpoints/vessels.ts
export const vesselApi = {
  createTracking: async (data: TrackingRequest): Promise<TrackingResponse> => {
    const response = await apiClient.post('/vessels/tracking', data);
    return response.data;
  }
};

// 2. React Query Mutation
// features/vessels/hooks/useCreateTracking.ts
export const useCreateTracking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: vesselApi.createTracking,
    onSuccess: (data) => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: ['trackings'] });
      
      // Show success message
      toast.success('Tracking created successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    }
  });
};

// 3. Component Usage
// features/vessels/components/TrackingForm.tsx
export const TrackingForm: React.FC = () => {
  const { mutate, isLoading } = useCreateTracking();
  const { register, handleSubmit } = useForm<TrackingRequest>();
  
  const onSubmit = (data: TrackingRequest) => {
    mutate(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
      <Button type="submit" loading={isLoading}>
        Create Tracking
      </Button>
    </form>
  );
};
```

### Pattern 3: Optimistic Updates

```typescript
// features/vessels/hooks/useToggleFavorite.ts
export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: vesselApi.toggleFavorite,
    onMutate: async (vesselId: string) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ['vessels'] });
      
      // Get current data
      const previous = queryClient.getQueryData(['vessels']);
      
      // Optimistically update
      queryClient.setQueryData(['vessels'], (old: VesselResponse) => ({
        ...old,
        vessels: old.vessels.map(v => 
          v.id === vesselId 
            ? { ...v, isFavorite: !v.isFavorite }
            : v
        )
      }));
      
      return { previous };
    },
    onError: (err, vesselId, context) => {
      // Rollback on error
      queryClient.setQueryData(['vessels'], context?.previous);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['vessels'] });
    }
  });
};
```

### Pattern 4: Global State Management

```typescript
// 1. Store Definition
// stores/uiStore.ts
interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeModal: null,
  theme: 'light',
  
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  
  openModal: (modalId) => set({ activeModal: modalId }),
  
  closeModal: () => set({ activeModal: null })
}));

// 2. Component Usage
// components/layout/Sidebar.tsx
export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  
  return (
    <aside className={clsx('sidebar', {
      'sidebar-open': sidebarOpen,
      'sidebar-closed': !sidebarOpen
    })}>
      {/* Sidebar content */}
    </aside>
  );
};
```

### Pattern 5: Form Data Flow

```typescript
// 1. Form Schema
// features/compliance/schemas/reportSchema.ts
export const reportSchema = z.object({
  vesselId: z.string().min(1, 'Vessel is required'),
  reportType: z.enum(['sanctions', 'compliance', 'risk']),
  dateRange: z.object({
    start: z.date(),
    end: z.date()
  })
});

// 2. Form Component
// features/compliance/components/ReportForm.tsx
export const ReportForm: React.FC = () => {
  const { mutate, isLoading } = useGenerateReport();
  
  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: 'compliance'
    }
  });
  
  const onSubmit = async (data: ReportFormData) => {
    mutate(data, {
      onSuccess: (report) => {
        // Navigate to report view
        navigate(`/reports/${report.id}`);
      }
    });
  };
  
  return (
    <Form form={form} onSubmit={onSubmit}>
      <FormField
        name="vesselId"
        render={({ field }) => (
          <VesselSelect {...field} />
        )}
      />
      {/* Other fields */}
    </Form>
  );
};
```

## Data Transformation Patterns

### API Response Transformation

```typescript
// api/transformers/vessel.transformer.ts
export const transformVesselResponse = (raw: RawVessel): Vessel => ({
  id: raw.vessel_id,
  name: raw.vessel_name,
  imo: raw.imo_number,
  flag: raw.flag_country,
  lastPosition: {
    lat: raw.last_lat,
    lng: raw.last_lng,
    timestamp: new Date(raw.last_update)
  },
  riskScore: calculateRiskScore(raw)
});

// Use in API layer
export const vesselApi = {
  getVessels: async (): Promise<Vessel[]> => {
    const { data } = await apiClient.get('/vessels');
    return data.map(transformVesselResponse);
  }
};
```

### Computed/Derived Data

```typescript
// features/vessels/hooks/useVesselStats.ts
export const useVesselStats = () => {
  const { data: vessels } = useVessels();
  
  return useMemo(() => {
    if (!vessels) return null;
    
    return {
      total: vessels.length,
      highRisk: vessels.filter(v => v.riskScore > 75).length,
      tracked: vessels.filter(v => v.isTracked).length,
      flagDistribution: groupBy(vessels, 'flag')
    };
  }, [vessels]);
};
```

## Error Handling Flow

### API Error Handling

```typescript
// api/client.ts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      authStore.getState().logout();
      window.location.href = '/auth/login';
    }
    
    // Transform error for consistency
    const enhancedError = {
      message: error.response?.data?.message || 'An error occurred',
      status: error.response?.status,
      code: error.response?.data?.code
    };
    
    return Promise.reject(enhancedError);
  }
);
```

### Component Error Boundaries

```typescript
// components/feedback/ErrorBoundary.tsx
export class ErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.resetError} />;
    }
    
    return this.props.children;
  }
}
```

## Loading State Management

### Hierarchical Loading States

```typescript
// 1. Global Loading (App Level)
const AppLoader = () => {
  const isLoading = useGlobalLoading();
  if (isLoading) return <FullPageLoader />;
  return null;
};

// 2. Route Loading (Page Level)
const PageLoader = () => {
  const navigation = useNavigation();
  if (navigation.state === 'loading') return <PageSkeleton />;
  return <Outlet />;
};

// 3. Component Loading (Feature Level)
const DataTable = () => {
  const { data, isLoading } = useTableData();
  if (isLoading) return <TableSkeleton />;
  return <Table data={data} />;
};

// 4. Action Loading (Element Level)
const SaveButton = () => {
  const { mutate, isLoading } = useSaveData();
  return (
    <Button onClick={mutate} loading={isLoading}>
      Save
    </Button>
  );
};
```

## Real-time Data Patterns

### WebSocket Integration

```typescript
// services/websocket.ts
export const useWebSocket = (url: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      // Update React Query cache
      queryClient.setQueryData(
        ['vessel', update.vesselId],
        (old: Vessel) => ({ ...old, ...update.data })
      );
    };
    
    return () => ws.close();
  }, [url, queryClient]);
};
```

### Polling Pattern

```typescript
// features/vessels/hooks/useVesselTracking.ts
export const useVesselTracking = (vesselId: string) => {
  return useQuery({
    queryKey: ['vessel-tracking', vesselId],
    queryFn: () => vesselApi.getTracking(vesselId),
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: true
  });
};
```

## Performance Optimization

### Data Normalization

```typescript
// stores/dataStore.ts
interface NormalizedData {
  vessels: Record<string, Vessel>;
  ports: Record<string, Port>;
  trackings: Record<string, Tracking>;
}

// Normalize API response
const normalizeVessels = (vessels: Vessel[]) => {
  return vessels.reduce((acc, vessel) => {
    acc[vessel.id] = vessel;
    return acc;
  }, {} as Record<string, Vessel>);
};
```

### Selective Updates

```typescript
// Only update changed fields
queryClient.setQueryData(['vessels'], (old: VesselList) => ({
  ...old,
  vessels: old.vessels.map(v => 
    v.id === updatedVessel.id
      ? { ...v, ...updatedVessel }
      : v
  )
}));
```

## Best Practices

1. **Single Source of Truth** - Each piece of data has one authoritative source
2. **Unidirectional Flow** - Data flows in one direction through the app
3. **Immutable Updates** - Never mutate data directly
4. **Optimistic UI** - Update UI immediately for better UX
5. **Error Recovery** - Always provide fallback UI and recovery options
6. **Loading States** - Show appropriate feedback during async operations
7. **Cache Invalidation** - Know when to refresh stale data
8. **Type Safety** - Use TypeScript for all data structures