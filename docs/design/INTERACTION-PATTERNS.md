# Interaction Patterns Guide

## Overview
This document defines patterns for user interactions including loading states, error handling, empty states, and user feedback. These patterns ensure consistent and intuitive user experiences across the application.

## Loading States

### Loading Hierarchy
Loading states should be contextual and proportional to the scope of the operation.

```typescript
// 1. Full Page Loading
export const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-4 text-neutral-600">Loading...</p>
    </div>
  </div>
);

// 2. Section Loading
export const SectionLoader: React.FC<{ height?: string }> = ({ height = '400px' }) => (
  <div className="flex items-center justify-center" style={{ height }}>
    <Spinner size="md" />
  </div>
);

// 3. Inline Loading
export const InlineLoader: React.FC<{ text?: string }> = ({ text = 'Loading' }) => (
  <div className="inline-flex items-center text-neutral-600">
    <Spinner size="sm" className="mr-2" />
    <span>{text}</span>
  </div>
);

// 4. Button Loading
export const LoadingButton: React.FC<ButtonProps> = ({ children, loading, ...props }) => (
  <Button disabled={loading} {...props}>
    {loading ? (
      <>
        <Spinner size="sm" className="mr-2" />
        Processing...
      </>
    ) : (
      children
    )}
  </Button>
);
```

### Skeleton Screens
Use skeletons for content that has predictable shapes.

```typescript
// Base Skeleton Component
export const Skeleton: React.FC<{
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}> = ({ 
  className, 
  variant = 'rectangular', 
  animation = 'pulse' 
}) => {
  const baseStyles = 'bg-neutral-200';
  
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  };
  
  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };
  
  return (
    <div 
      className={clsx(
        baseStyles,
        variants[variant],
        animations[animation],
        className
      )}
    />
  );
};

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="w-full">
    {/* Header */}
    <div className="border-b border-neutral-200 px-6 py-3 bg-neutral-50">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="border-b border-neutral-200 px-6 py-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-32" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Card Skeleton
export const CardSkeleton: React.FC = () => (
  <Card padding="md">
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  </Card>
);
```

### Progressive Loading
Load critical content first, then enhance progressively.

```typescript
export const ProgressiveList: React.FC<{ items: any[] }> = ({ items }) => {
  const [visibleCount, setVisibleCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const loadMore = useCallback(() => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 10, items.length));
      setIsLoadingMore(false);
    }, 500);
  }, [items.length]);
  
  return (
    <>
      <div className="space-y-4">
        {items.slice(0, visibleCount).map((item, index) => (
          <ListItem key={index} item={item} />
        ))}
      </div>
      
      {visibleCount < items.length && (
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={loadMore}
            loading={isLoadingMore}
          >
            Load More ({items.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </>
  );
};
```

## Error States

### Error Hierarchy

```typescript
// 1. Page-Level Error
export const PageError: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = ({ 
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry
}) => (
  <div className="min-h-[400px] flex flex-col items-center justify-center p-6">
    <div className="text-center max-w-md">
      <div className="mx-auto w-12 h-12 text-red-500 mb-4">
        <AlertCircle className="w-full h-full" />
      </div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">{title}</h2>
      <p className="text-neutral-600 mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry}>Try Again</Button>
      )}
    </div>
  </div>
);

// 2. Inline Error
export const InlineError: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center text-sm text-red-600 mt-1">
    <XCircle className="w-4 h-4 mr-1" />
    <span>{message}</span>
  </div>
);

// 3. Form Field Error
export const FieldError: React.FC<{ error?: FieldError }> = ({ error }) => {
  if (!error) return null;
  
  return (
    <p className="mt-1 text-sm text-red-600" role="alert">
      {error.message}
    </p>
  );
};
```

### Error Boundaries

```typescript
export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Log to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error!} />;
    }
    
    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <PageError
    title="Application Error"
    message={error.message}
    onRetry={() => window.location.reload()}
  />
);
```

### Network Error Handling

```typescript
export const NetworkErrorHandler: React.FC<{
  error: unknown;
  onRetry: () => void;
}> = ({ error, onRetry }) => {
  const errorInfo = getErrorInfo(error);
  
  return (
    <Alert variant="error" className="mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{errorInfo.title}</h4>
          <p className="mt-1 text-sm">{errorInfo.message}</p>
        </div>
        <Button size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </Alert>
  );
};

function getErrorInfo(error: unknown): { title: string; message: string } {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return {
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your connection.'
      };
    }
    
    switch (error.response.status) {
      case 401:
        return {
          title: 'Authentication Required',
          message: 'Please log in to continue.'
        };
      case 403:
        return {
          title: 'Access Denied',
          message: 'You do not have permission to perform this action.'
        };
      case 404:
        return {
          title: 'Not Found',
          message: 'The requested resource could not be found.'
        };
      case 500:
        return {
          title: 'Server Error',
          message: 'An error occurred on the server. Please try again later.'
        };
      default:
        return {
          title: 'Error',
          message: error.response.data?.message || 'An unexpected error occurred.'
        };
    }
  }
  
  return {
    title: 'Error',
    message: 'An unexpected error occurred. Please try again.'
  };
}
```

## Empty States

### Empty State Patterns

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => (
  <div className={clsx('text-center py-12', className)}>
    {icon && (
      <div className="mx-auto w-12 h-12 text-neutral-400 mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-medium text-neutral-900 mb-1">{title}</h3>
    {description && (
      <p className="text-neutral-600 mb-4 max-w-sm mx-auto">{description}</p>
    )}
    {action && (
      <Button onClick={action.onClick}>{action.label}</Button>
    )}
  </div>
);

// Specific Empty States
export const NoResultsState: React.FC<{ searchTerm?: string }> = ({ searchTerm }) => (
  <EmptyState
    icon={<Search className="w-full h-full" />}
    title="No results found"
    description={
      searchTerm 
        ? `No results match "${searchTerm}". Try adjusting your search.`
        : "Try adjusting your filters or search terms."
    }
  />
);

export const NoDataState: React.FC<{ onCreate?: () => void }> = ({ onCreate }) => (
  <EmptyState
    icon={<Database className="w-full h-full" />}
    title="No data yet"
    description="Get started by adding your first item."
    action={onCreate ? { label: 'Add Item', onClick: onCreate } : undefined}
  />
);
```

## User Feedback

### Toast Notifications

```typescript
// Toast Component
export const Toast: React.FC<{
  variant?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
}> = ({ variant = 'info', title, description, action, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };
  
  return (
    <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{icons[variant]}</div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-neutral-900">{title}</p>
            {description && (
              <p className="mt-1 text-sm text-neutral-500">{description}</p>
            )}
            {action && (
              <button
                onClick={action.onClick}
                className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                {action.label}
              </button>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex rounded-md bg-white text-neutral-400 hover:text-neutral-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Hook
export const useToast = () => {
  const show = useCallback((options: ToastOptions) => {
    toast.custom((t) => (
      <Toast {...options} onClose={() => toast.dismiss(t.id)} />
    ));
  }, []);
  
  return {
    success: (title: string, description?: string) => 
      show({ variant: 'success', title, description }),
    error: (title: string, description?: string) => 
      show({ variant: 'error', title, description }),
    warning: (title: string, description?: string) => 
      show({ variant: 'warning', title, description }),
    info: (title: string, description?: string) => 
      show({ variant: 'info', title, description })
  };
};
```

### Progress Indicators

```typescript
// Linear Progress
export const LinearProgress: React.FC<{
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'error';
}> = ({ 
  value, 
  max = 100, 
  label, 
  showValue = false, 
  size = 'md',
  variant = 'primary' 
}) => {
  const percentage = (value / max) * 100;
  
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  
  const colors = {
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500'
  };
  
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-sm text-neutral-700">{label}</span>}
          {showValue && <span className="text-sm text-neutral-500">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={clsx('w-full bg-neutral-200 rounded-full overflow-hidden', sizes[size])}>
        <div
          className={clsx('h-full transition-all duration-300 ease-out', colors[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Circular Progress
export const CircularProgress: React.FC<{
  value: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
}> = ({ value, size = 40, strokeWidth = 4, showValue = false }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative inline-flex">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-neutral-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary-500 transition-all duration-300 ease-out"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium">{value}%</span>
        </div>
      )}
    </div>
  );
};
```

### Confirmation Dialogs

```typescript
export const useConfirm = () => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
    options: ConfirmOptions;
  } | null>(null);
  
  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPromise({ resolve, options });
    });
  }, []);
  
  const handleClose = useCallback((value: boolean) => {
    promise?.resolve(value);
    setPromise(null);
  }, [promise]);
  
  const ConfirmDialog = promise && (
    <Modal
      isOpen={true}
      onClose={() => handleClose(false)}
      title={promise.options.title}
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => handleClose(false)}>
            {promise.options.cancelText || 'Cancel'}
          </Button>
          <Button 
            variant={promise.options.variant || 'primary'} 
            onClick={() => handleClose(true)}
          >
            {promise.options.confirmText || 'Confirm'}
          </Button>
        </div>
      }
    >
      <p className="text-neutral-600">{promise.options.message}</p>
    </Modal>
  );
  
  return { confirm, ConfirmDialog };
};

// Usage
const MyComponent = () => {
  const { confirm, ConfirmDialog } = useConfirm();
  
  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger'
    });
    
    if (confirmed) {
      // Perform delete
    }
  };
  
  return (
    <>
      <Button onClick={handleDelete}>Delete</Button>
      {ConfirmDialog}
    </>
  );
};
```

## Optimistic Updates

```typescript
// Optimistic UI Pattern
export const useOptimisticUpdate = <T,>(
  initialValue: T,
  serverUpdate: (value: T) => Promise<T>
) => {
  const [value, setValue] = useState(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const update = useCallback(async (newValue: T) => {
    const previousValue = value;
    
    // Optimistically update UI
    setValue(newValue);
    setIsUpdating(true);
    setError(null);
    
    try {
      // Sync with server
      const confirmedValue = await serverUpdate(newValue);
      setValue(confirmedValue);
    } catch (err) {
      // Rollback on error
      setValue(previousValue);
      setError(err as Error);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [value, serverUpdate]);
  
  return { value, update, isUpdating, error };
};
```

## Drag and Drop

```typescript
export const DraggableList: React.FC<{
  items: Array<{ id: string; content: React.ReactNode }>;
  onReorder: (items: string[]) => void;
}> = ({ items, onReorder }) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent, dropId: string) => {
    e.preventDefault();
    
    if (draggedItem && draggedItem !== dropId) {
      const dragIndex = items.findIndex(item => item.id === draggedItem);
      const dropIndex = items.findIndex(item => item.id === dropId);
      
      const newItems = [...items];
      const [removed] = newItems.splice(dragIndex, 1);
      newItems.splice(dropIndex, 0, removed);
      
      onReorder(newItems.map(item => item.id));
    }
    
    setDraggedItem(null);
  };
  
  return (
    <div className="space-y-2">
      {items.map(item => (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, item.id)}
          className={clsx(
            'p-4 bg-white border rounded-lg cursor-move transition-opacity',
            draggedItem === item.id && 'opacity-50'
          )}
        >
          <div className="flex items-center">
            <GripVertical className="w-5 h-5 text-neutral-400 mr-3" />
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
};
```

## Best Practices

### Loading States
1. Show loading states immediately (no delay)
2. Use skeletons for predictable content layouts
3. Preserve layout to prevent jumps
4. Show progress for long operations
5. Allow cancellation when possible

### Error Handling
1. Be specific about what went wrong
2. Provide actionable next steps
3. Log errors for debugging
4. Don't expose technical details to users
5. Always provide a recovery path

### Empty States
1. Explain why the state is empty
2. Provide clear next actions
3. Use illustrations sparingly
4. Keep messages positive and helpful
5. Consider different empty contexts

### Feedback
1. Acknowledge user actions immediately
2. Use appropriate feedback intensity
3. Auto-dismiss non-critical messages
4. Allow manual dismissal
5. Stack multiple notifications properly