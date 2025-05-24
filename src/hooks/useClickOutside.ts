import { useEffect, useRef, RefObject } from 'react'

/**
 * Hook that detects clicks outside of the passed ref
 *
 * @param handler - Function to call when click outside is detected
 * @param refs - Array of refs to consider as "inside" (optional)
 * @returns ref - The main ref to attach to the element
 *
 * @example
 * const ref = useClickOutside(() => setIsOpen(false))
 * return <div ref={ref}>...</div>
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  refs?: RefObject<HTMLElement>[],
): RefObject<T> {
  const ref = useRef<T>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node

      // Check if click is outside the main ref
      if (ref.current && !ref.current.contains(target)) {
        // If additional refs are provided, check those too
        if (refs && refs.length > 0) {
          const isInsideAnyRef = refs.some(
            (r) => r.current && r.current.contains(target),
          )
          if (!isInsideAnyRef) {
            handler()
          }
        } else {
          handler()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [handler, refs])

  return ref
}
