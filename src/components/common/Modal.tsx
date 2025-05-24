import { ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

/**
 * Props for the Modal component.
 */
export interface ModalProps {
  /** Controls modal visibility */
  isOpen: boolean
  /** Callback fired when modal should close */
  onClose: () => void
  /** Optional modal title displayed in header */
  title?: string
  /** Modal content */
  children: ReactNode
  /** Size variant affecting modal width */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Whether clicking the overlay closes the modal */
  closeOnOverlayClick?: boolean
  /** Whether pressing Escape key closes the modal */
  closeOnEsc?: boolean
  /** Whether to show the X close button in header */
  showCloseButton?: boolean
  /** Optional footer content (typically action buttons) */
  footer?: ReactNode
}

/**
 * Accessible modal dialog component with overlay.
 * Supports keyboard navigation, focus management, and customizable behavior.
 *
 * @component
 * @example
 * <Modal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Confirm Action"
 *   footer={
 *     <>
 *       <Button variant="outline" onClick={() => setShowModal(false)}>
 *         Cancel
 *       </Button>
 *       <Button onClick={handleConfirm}>Confirm</Button>
 *     </>
 *   }
 * >
 *   Are you sure you want to proceed?
 * </Modal>
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  footer,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, closeOnEsc])

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div
        ref={modalRef}
        className={clsx(
          'relative z-10 w-full rounded-lg bg-white shadow-xl',
          sizeClasses[size],
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Close modal"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="border-t border-gray-200 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default Modal
