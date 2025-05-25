import * as React from 'react'
import { cn } from '@/utils/cn'

export interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
  name?: string
  id?: string
  className?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked = false,
      onCheckedChange,
      disabled,
      label,
      description,
      name,
      id,
      className,
    },
    ref,
  ) => {
    const switchId = id || name || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={cn('flex items-start gap-3', className)}>
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          id={switchId}
          name={name}
          disabled={disabled}
          onClick={() => onCheckedChange?.(!checked)}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full',
            'transition-colors duration-200 ease-in-out focus:outline-none',
            'focus-visible:ring-2 focus-visible:ring-[#0066FF] focus-visible:ring-offset-2',
            checked ? 'bg-[#0066FF]' : 'bg-gray-200',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <span
            className={cn(
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0',
              'transition duration-200 ease-in-out',
              checked ? 'translate-x-5' : 'translate-x-0.5',
              'mt-0.5',
            )}
          />
        </button>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={switchId}
                className="text-sm font-medium text-gray-900 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <span className="text-sm text-gray-500">{description}</span>
            )}
          </div>
        )}
      </div>
    )
  },
)

Switch.displayName = 'Switch'

export default Switch
