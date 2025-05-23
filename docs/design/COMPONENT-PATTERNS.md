# Component Patterns Guide

## Overview
This document provides reusable component patterns that form the building blocks of the application. Each pattern includes structure, variants, accessibility considerations, and usage examples.

## Button Component

### Base Pattern
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  children,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-ring';
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-300',
    secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:bg-neutral-50',
    outline: 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:border-neutral-200',
    ghost: 'text-neutral-700 hover:bg-neutral-100 disabled:text-neutral-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded',
    md: 'px-4 py-2 text-base rounded-md',
    lg: 'px-6 py-3 text-lg rounded-lg'
  };
  
  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner className="mr-2" size={size} />
      ) : icon && iconPosition === 'left' ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};
```

### Usage Examples
```typescript
// Primary action
<Button onClick={handleSubmit}>Save Changes</Button>

// With icon
<Button icon={<Plus size={16} />}>Add Vessel</Button>

// Loading state
<Button loading={isSubmitting}>Processing...</Button>

// Danger action
<Button variant="danger" onClick={handleDelete}>Delete</Button>
```

## Card Component

### Base Pattern
```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  footer,
  padding = 'md',
  hoverable = false,
  onClick,
  className,
  children
}) => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };
  
  return (
    <div
      className={clsx(
        'bg-white rounded-lg border border-neutral-200 shadow-sm',
        hoverable && 'hover:shadow-md transition-shadow cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {(title || subtitle || actions) && (
        <div className={clsx('border-b border-neutral-200', paddings[padding])}>
          <div className="flex items-start justify-between">
            <div>
              {title && <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>}
              {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
            </div>
            {actions && <div className="ml-4">{actions}</div>}
          </div>
        </div>
      )}
      
      <div className={paddings[padding]}>{children}</div>
      
      {footer && (
        <div className={clsx('border-t border-neutral-200 bg-neutral-50', paddings[padding])}>
          {footer}
        </div>
      )}
    </div>
  );
};
```

### Specialized Card Patterns
```typescript
// Stat Card
export const StatCard: React.FC<StatCardProps> = ({ label, value, change, icon }) => (
  <Card padding="sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-neutral-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
        {change && (
          <p className={clsx('mt-1 text-sm', change > 0 ? 'text-green-600' : 'text-red-600')}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
          </p>
        )}
      </div>
      {icon && <div className="text-neutral-400">{icon}</div>}
    </div>
  </Card>
);

// List Card
export const ListCard: React.FC<ListCardProps> = ({ title, items, onItemClick }) => (
  <Card title={title} padding="none">
    <ul className="divide-y divide-neutral-200">
      {items.map((item, index) => (
        <li 
          key={index} 
          className="px-4 py-3 hover:bg-neutral-50 cursor-pointer"
          onClick={() => onItemClick(item)}
        >
          {item.label}
        </li>
      ))}
    </ul>
  </Card>
);
```

## Modal Component

### Base Pattern
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  footer,
  children
}) => {
  useEffect(() => {
    if (!closeOnEsc || !isOpen) return;
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, closeOnEsc]);
  
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };
  
  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={closeOnOverlayClick ? onClose : undefined}
        />
        
        {/* Modal content */}
        <div className={clsx('relative bg-white rounded-lg shadow-xl w-full', sizes[size])}>
          {/* Header */}
          {title && (
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
              >
                <X size={20} />
              </button>
            </div>
          )}
          
          {/* Body */}
          <div className="px-6 py-4">{children}</div>
          
          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
```

### Modal Patterns
```typescript
// Confirmation Modal
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary'
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose}>{cancelText}</Button>
        <Button variant={variant} onClick={onConfirm}>{confirmText}</Button>
      </div>
    }
  >
    <p className="text-neutral-600">{message}</p>
  </Modal>
);
```

## Form Components

### Input Pattern
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  addon?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  addon,
  className,
  ...props
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-neutral-400">{icon}</span>
          </div>
        )}
        
        <div className="flex">
          {addon && (
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-neutral-300 bg-neutral-50 text-neutral-500 sm:text-sm">
              {addon}
            </span>
          )}
          
          <input
            className={clsx(
              'block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm',
              'focus:ring-primary-500 focus:border-primary-500',
              'disabled:bg-neutral-50 disabled:text-neutral-500',
              icon && 'pl-10',
              addon && 'rounded-l-none',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
        </div>
      </div>
      
      {hint && !error && (
        <p className="mt-1 text-sm text-neutral-500">{hint}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

### Select Pattern
```typescript
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder = 'Select an option',
  className,
  ...props
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        className={clsx(
          'block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm',
          'focus:ring-primary-500 focus:border-primary-500',
          'disabled:bg-neutral-50 disabled:text-neutral-500',
          error && 'border-red-300',
          className
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

### Form Field Wrapper
```typescript
export const FormField: React.FC<FormFieldProps> = ({ 
  name, 
  label, 
  required, 
  error, 
  hint, 
  children 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-sm text-neutral-500">{hint}</p>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

## Table Component

### Base Pattern
```typescript
interface TableProps<T> {
  columns: Array<{
    key: keyof T;
    header: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: T[keyof T], item: T) => React.ReactNode;
  }>;
  data: T[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  loading,
  emptyMessage = 'No data available',
  className
}: TableProps<T>) {
  if (loading) {
    return <TableSkeleton columns={columns.length} rows={5} />;
  }
  
  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            {columns.map(column => (
              <th
                key={String(column.key)}
                className={clsx(
                  'px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider',
                  `text-${column.align || 'left'}`
                )}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-neutral-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center text-neutral-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(item)}
                className={clsx(
                  onRowClick && 'cursor-pointer hover:bg-neutral-50'
                )}
              >
                {columns.map(column => (
                  <td
                    key={String(column.key)}
                    className={clsx(
                      'px-6 py-4 whitespace-nowrap text-sm text-neutral-900',
                      `text-${column.align || 'left'}`
                    )}
                  >
                    {column.render
                      ? column.render(item[column.key], item)
                      : item[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
```

### Table Patterns
```typescript
// Sortable Table
export const SortableTable = ({ columns, data, ...props }) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    
    return [...data].sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);
  
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };
  
  // Render with sort indicators
};

// Data Table with Actions
export const DataTable = ({ data, onEdit, onDelete }) => {
  const columns = [
    // ... other columns
    {
      key: 'actions',
      header: 'Actions',
      render: (_, item) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
            <Edit size={16} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(item)}>
            <Trash size={16} />
          </Button>
        </div>
      )
    }
  ];
  
  return <Table columns={columns} data={data} />;
};
```

## Alert Component

### Base Pattern
```typescript
interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  icon,
  onClose,
  className,
  children
}) => {
  const variants = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-400" />
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-400" />
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <XCircle className="w-5 h-5 text-red-400" />
    }
  };
  
  const styles = variants[variant];
  
  return (
    <div
      className={clsx(
        'p-4 rounded-md border',
        styles.bg,
        styles.border,
        className
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {icon || styles.icon}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={clsx('text-sm font-medium', styles.text)}>
              {title}
            </h3>
          )}
          <div className={clsx('text-sm', styles.text, title && 'mt-1')}>
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={clsx('ml-auto pl-3', styles.text, 'hover:opacity-75')}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
```

## Badge Component

### Base Pattern
```typescript
interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className,
  children
}) => {
  const variants = {
    default: 'bg-neutral-100 text-neutral-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm'
  };
  
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full mr-1.5', {
          'bg-neutral-400': variant === 'default',
          'bg-primary-400': variant === 'primary',
          'bg-green-400': variant === 'success',
          'bg-amber-400': variant === 'warning',
          'bg-red-400': variant === 'error'
        })} />
      )}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-75 focus:outline-none"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
```

## Usage Guidelines

### Composition Example
```typescript
// Complex form with all patterns
export const VesselTrackingForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  return (
    <Card title="Configure Vessel Tracking">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Vessel Name"
          placeholder="Enter vessel name or IMO"
          error={errors.vesselName?.message}
          {...register('vesselName')}
        />
        
        <Select
          label="Tracking Type"
          options={trackingTypes}
          error={errors.trackingType?.message}
          {...register('trackingType')}
        />
        
        <div className="flex gap-3 justify-end">
          <Button variant="outline">Cancel</Button>
          <Button type="submit">Start Tracking</Button>
        </div>
      </form>
    </Card>
  );
};
```

### Accessibility Checklist
- All interactive elements have focus states
- Form elements have associated labels
- Error messages are announced to screen readers
- Modals trap focus and return focus on close
- Tables have proper header associations
- Color is not the only indicator of state