import { useState, useEffect } from 'react'

/**
 * Hook for matching media queries
 *
 * @param query - The media query to match (e.g., '(min-width: 768px)')
 * @returns Whether the media query matches
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 767px)')
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // Prevent SSR issues
    if (typeof window === 'undefined') {
      return false
    }
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(query)

    // Update the state with the current match status
    setMatches(mediaQuery.matches)

    // Define the event handler
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add the event listener
    if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
    } else {
      mediaQuery.addEventListener('change', handleChange)
    }

    // Clean up
    return () => {
      if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange)
      } else {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
  }, [query])

  return matches
}

// Common breakpoint helpers
export const useIsMobile = () => useMediaQuery('(max-width: 640px)')
export const useIsTablet = () =>
  useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)')
