import { ReactNode } from 'react'
import clsx from 'clsx'

export interface Column<T> {
  key: string
  header: string
  accessor: (item: T) => ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
}

export interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T, index: number) => string | number
  onRowClick?: (item: T) => void
  emptyMessage?: string
  loading?: boolean
  striped?: boolean
  hoverable?: boolean
  compact?: boolean
  className?: string
}

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
