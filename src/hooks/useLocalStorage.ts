import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook for syncing state with localStorage with automatic persistence
 * and cross-tab synchronization support.
 *
 * @template T - The type of the stored value
 * @param key - The localStorage key to store the value under
 * @param initialValue - The initial value if no stored value exists
 * @returns [storedValue, setValue] - Current value and setter function
 *
 * @example
 * const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light')
 * 
 * @remarks
 * - Automatically syncs changes across multiple tabs/windows
 * - Handles JSON serialization/deserialization
 * - Provides error handling for localStorage failures
 * - Uses functional updates to prevent stale closures
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  // Store initial value in ref to avoid stale closures
  const initialValueRef = useRef(initialValue)
  
  // Update ref when initialValue changes
  useEffect(() => {
    initialValueRef.current = initialValue
  }, [initialValue])
  
  // Get from local storage then parse stored json or return initialValue
  const readValue = useCallback((): T => {
    // Prevent build error "window is undefined" but keeps working
    if (typeof window === 'undefined') {
      return initialValueRef.current
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValueRef.current
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValueRef.current
    }
  }, [key])

  // State to store our value
  // Use lazy initial state to prevent reading localStorage on every render
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Handle both value and function forms
        setStoredValue((currentValue) => {
          const newValue = value instanceof Function ? value(currentValue) : value
          
          // Save to local storage
          window.localStorage.setItem(key, JSON.stringify(newValue))
          
          // Dispatch event to notify other hooks
          window.dispatchEvent(new Event('local-storage'))
          
          return newValue
        })
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key],
  )

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue())
    }

    // Listen for storage changes from other tabs/windows
    // Note: 'storage' event only fires for changes from other documents
    window.addEventListener('storage', handleStorageChange)

    // Listen for storage changes from the current tab
    // This custom event is dispatched in setValue to ensure same-tab updates
    window.addEventListener('local-storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('local-storage', handleStorageChange)
    }
  }, [readValue])

  return [storedValue, setValue]
}
