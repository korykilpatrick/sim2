import { SelectHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  fullWidth?: boolean
  options: SelectOption[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      fullWidth = true,
      id,
      options,
      placeholder = 'Select an option',
      ...props
    },
    ref,
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={clsx('relative', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              'block appearance-none rounded-md border px-3 py-2 pr-8 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              error
                ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 text-gray-900 focus:border-primary-500',
              fullWidth && 'w-full',
              !props.value && 'text-gray-500',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${selectId}-error`
                : hint
                  ? `${selectId}-hint`
                  : undefined
            }
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {error && (
          <p id={`${selectId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${selectId}-hint`} className="mt-1 text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    )
  },
)

Select.displayName = 'Select'

export default Select
