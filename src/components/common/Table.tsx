import { ReactNode } from 'react'
import clsx from 'clsx'

/**
 * Column configuration for table rendering.
 *
 * @template T - The type of data items in the table
 */
export interface Column<T> {
  /** Unique column identifier */
  key: string
  /** Column header text */
  header: string
  /** Function to extract/render cell content from data item */
  accessor: (item: T) => ReactNode
  /** Optional CSS width (e.g., 'w-32', 'w-1/4') */
  width?: string
  /** Text alignment within the column */
  align?: 'left' | 'center' | 'right'
  /** Whether this column supports sorting (future feature) */
  sortable?: boolean
}

/**
 * Props for the Table component.
 *
 * @template T - The type of data items to display
 */
export interface TableProps<T> {
  /** Array of data items to display */
  data: T[]
  /** Column configurations */
  columns: Column<T>[]
  /** Function to generate unique key for each row */
  keyExtractor: (item: T, index: number) => string | number
  /** Callback fired when a row is clicked */
  onRowClick?: (item: T) => void
  /** Message displayed when data array is empty */
  emptyMessage?: string
  /** Shows loading state instead of table content */
  loading?: boolean
  /** Alternates row background colors */
  striped?: boolean
  /** Highlights rows on hover */
  hoverable?: boolean
  /** Reduces padding for denser display */
  compact?: boolean
  /** Additional CSS classes for the table wrapper */
  className?: string
}

/**
 * Flexible data table component with responsive design.
 * Supports custom column rendering, row interactions, and various display modes.
 *
 * @template T - The type of data items to display
 *
 * @component
 * @example
 * const columns: Column<User>[] = [
 *   { key: 'name', header: 'Name', accessor: (user) => user.name },
 *   { key: 'email', header: 'Email', accessor: (user) => user.email },
 *   { key: 'status', header: 'Status', accessor: (user) => (
 *     <StatusBadge status={user.status} />
 *   )}
 * ];
 *
 * <Table
 *   data={users}
 *   columns={columns}
 *   keyExtractor={(user) => user.id}
 *   onRowClick={(user) => navigate(`/users/${user.id}`)}
 * />
 */
function Table<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
  loading = false,
  striped = true,
  hoverable = true,
  compact = false,
  className,
}: TableProps<T>) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'overflow-hidden rounded-lg border border-gray-200',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={clsx(
                    'font-medium text-gray-900',
                    compact ? 'px-3 py-2 text-xs' : 'px-6 py-3 text-sm',
                    alignClasses[column.align || 'left'],
                    column.width,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={clsx('divide-y divide-gray-200 bg-white')}>
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                onClick={() => onRowClick?.(item)}
                className={clsx(
                  striped && index % 2 === 1 && 'bg-gray-50',
                  hoverable && 'hover:bg-gray-100',
                  onRowClick && 'cursor-pointer',
                  'transition-colors',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={clsx(
                      'text-gray-900',
                      compact ? 'px-3 py-2 text-xs' : 'px-6 py-4 text-sm',
                      alignClasses[column.align || 'left'],
                      column.width,
                    )}
                  >
                    {column.accessor(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Table
