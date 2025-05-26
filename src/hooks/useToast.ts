import { create } from 'zustand'

/**
 * Types of toast notifications
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * Toast notification object
 * @interface Toast
 * @property {string} id - Unique identifier for the toast
 * @property {ToastType} type - Type of toast (success, error, warning, info)
 * @property {string} message - Message to display in the toast
 * @property {number} [duration] - Duration in milliseconds before auto-dismiss (0 = manual dismiss only)
 */
export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

/**
 * Internal toast store interface
 * @internal
 */
interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}`
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))

    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, toast.duration || 5000)
    }
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))

/**
 * Hook for showing and managing toast notifications
 * @returns {Object} Toast control functions
 * @returns {Function} showToast - Function to show a new toast
 * @returns {Function} removeToast - Function to manually remove a toast
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { showToast } = useToast()
 *   
 *   const handleSuccess = () => {
 *     showToast({
 *       type: 'success',
 *       message: 'Operation completed successfully!',
 *       duration: 3000 // Auto-dismiss after 3 seconds
 *     })
 *   }
 *   
 *   const handleError = (error: Error) => {
 *     showToast({
 *       type: 'error',
 *       message: error.message,
 *       duration: 0 // Manual dismiss only
 *     })
 *   }
 *   
 *   return <button onClick={handleSuccess}>Show Success</button>
 * }
 * ```
 */
export function useToast() {
  const { addToast, removeToast } = useToastStore()

  const showToast = (toast: Omit<Toast, 'id'>) => {
    addToast(toast)
  }

  return {
    showToast,
    removeToast,
  }
}

/**
 * Hook to access the current list of active toasts
 * @returns {Toast[]} Array of active toast notifications
 * 
 * @example
 * ```typescript
 * function ToastContainer() {
 *   const toasts = useToasts()
 *   const { removeToast } = useToast()
 *   
 *   return (
 *     <div className="toast-container">
 *       {toasts.map(toast => (
 *         <div key={toast.id} className={`toast toast-${toast.type}`}>
 *           <span>{toast.message}</span>
 *           <button onClick={() => removeToast(toast.id)}>×</button>
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useToasts() {
  return useToastStore((state) => state.toasts)
}
