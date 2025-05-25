import { ToastContainer } from '@/components/feedback'
import { useToasts } from '@/hooks/useToast'

export function ToastProvider() {
  const toasts = useToasts()

  return (
    <ToastContainer
      toasts={toasts}
      onRemove={() => {
        // Toast removal is handled by the store's auto-removal
        // This is just for manual dismissal
      }}
    />
  )
}
