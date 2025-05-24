import { ReactNode } from 'react'
import clsx from 'clsx'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

/**
 * Available alert types with distinct visual styles.
 */
export type AlertType = 'success' | 'error' | 'warning' | 'info'

/**
 * Props for the Alert component.
 */
export interface AlertProps {
  /** Alert severity type determining color scheme */
  type?: AlertType
  /** Optional bold title text */
  title?: string
  /** Main alert message content */
  message: string | ReactNode
  /** Whether the alert can be dismissed by the user */
  dismissible?: boolean
  /** Callback fired when dismiss button is clicked */
  onDismiss?: () => void
  /** Additional CSS classes */
  className?: string
  /** Whether to show the type-specific icon */
  icon?: boolean
}

/**
 * Contextual feedback messages for user actions.
 * Supports multiple severity levels with appropriate styling and icons.
 *
 * @component
 * @example
 * <Alert
 *   type="success"
 *   title="Success!"
 *   message="Your changes have been saved."
 *   dismissible
 *   onDismiss={() => setShowAlert(false)}
 * />
 *
 * @example
 * <Alert type="error" message="Failed to connect to server" />
 */
const Alert = ({
  type = 'info',
  title,
  message,
  dismissible = false,
  onDismiss,
  className,
  icon = true,
}: AlertProps) => {
  const colorMap = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-400',
      text: 'text-green-800',
      icon: 'text-green-400',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      text: 'text-red-800',
      icon: 'text-red-400',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      text: 'text-yellow-800',
      icon: 'text-yellow-400',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-800',
      icon: 'text-blue-400',
    },
  }

  const iconMap = {
    success: <CheckCircle2 className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  }

  const colors = colorMap[type]

  return (
    <div
      className={clsx(
        'rounded-lg border-l-4 p-4',
        colors.bg,
        colors.border,
        className,
      )}
      role="alert"
    >
      <div className="flex">
        {icon && (
          <div className={clsx('flex-shrink-0', colors.icon)}>
            {iconMap[type]}
          </div>
        )}
        <div className={clsx('flex-1', icon && 'ml-3')}>
          {title && (
            <h3 className={clsx('text-sm font-medium', colors.text)}>
              {title}
            </h3>
          )}
          <div className={clsx('text-sm', colors.text, title && 'mt-2')}>
            {message}
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={clsx(
                'inline-flex rounded-md p-1.5 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2',
                colors.text,
                `focus:ring-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-600`,
              )}
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Alert
