import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * Props for the Toast component
 */
export interface ToastProps {
  /**
   * Unique identifier for the toast
   */
  id: string
  /**
   * Message to display in the toast
   */
  message: string
  /**
   * Type of toast notification which determines styling and icon
   * @default 'info'
   */
  type?: ToastType
  /**
   * Duration in milliseconds before auto-dismissing the toast
   * @default 5000
   */
  duration?: number
  /**
   * Callback function called when the toast is closed
   */
  onClose?: () => void
}

/**
 * A toast notification component that displays temporary messages to users.
 * Supports different types (success, error, warning, info) with appropriate
 * icons and styling. Auto-dismisses after a configurable duration.
 *
 * @param {ToastProps} props - The component props
 * @returns {React.ReactPortal} The rendered toast notification portal
 *
 * @example
 * ```tsx
 * // Success toast
 * <Toast
 *   id="toast-1"
 *   message="Operation completed successfully!"
 *   type="success"
 * />
 *
 * // Error toast with custom duration
 * <Toast
 *   id="toast-2"
 *   message="Something went wrong"
 *   type="error"
 *   duration={10000}
 * />
 *
 * // With close callback
 * <Toast
 *   id="toast-3"
 *   message="File uploaded"
 *   type="success"
 *   onClose={() => console.log('Toast closed')}
 * />
 * ```
 */
const Toast = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300) // Wait for animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const iconMap = {
    success: <CheckCircle2 className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  }

  const colorMap = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  }

  const iconColorMap = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  }

  return createPortal(
    <div
      className={clsx(
        'fixed right-4 top-4 z-50 flex max-w-sm items-start space-x-3 rounded-lg border p-4 shadow-lg transition-all duration-300',
        colorMap[type],
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={clsx('flex-shrink-0', iconColorMap[type])}>
        {iconMap[type]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(() => onClose?.(), 300)
        }}
        className="ml-auto flex-shrink-0 rounded-md p-1 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>,
    document.body,
  )
}

/**
 * Props for the ToastContainer component
 */
export interface ToastContainerProps {
  /**
   * Array of toast notifications to display
   */
  toasts: ToastProps[]
  /**
   * Callback function to remove a toast by its ID
   */
  onRemove: (id: string) => void
}

/**
 * Container component for managing and displaying multiple toast notifications.
 * Handles positioning and stacking of toasts with smooth transitions.
 *
 * @param {ToastContainerProps} props - The component props
 * @returns {JSX.Element} The rendered toast container
 *
 * @example
 * ```tsx
 * const MyApp = () => {
 *   const [toasts, setToasts] = useState<ToastProps[]>([]);
 *
 *   const addToast = (toast: Omit<ToastProps, 'id'>) => {
 *     const id = Date.now().toString();
 *     setToasts(prev => [...prev, { ...toast, id }]);
 *   };
 *
 *   const removeToast = (id: string) => {
 *     setToasts(prev => prev.filter(toast => toast.id !== id));
 *   };
 *
 *   return (
 *     <>
 *       <App />
 *       <ToastContainer toasts={toasts} onRemove={removeToast} />
 *     </>
 *   );
 * };
 * ```
 */
export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ transform: `translateY(${index * 80}px)` }}
          className="transition-transform duration-300"
        >
          <Toast {...toast} onClose={() => onRemove(toast.id)} />
        </div>
      ))}
    </>
  )
}

export default Toast
