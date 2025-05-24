import { useState, useEffect, useCallback } from 'react'

/**
 * Hook for syncing state with localStorage
 *
 * @param key - The localStorage key
 * @param initialValue - The initial value if no stored value exists
 * @returns [storedValue, setValue] - Current value and setter function
 *
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'light')
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  // Get from local storage then parse stored json or return initialValue
  const readValue = useCallback((): T => {
    // Prevent build error "window is undefined" but keeps working
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
  }, [initialValue, key])

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue)

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const newValue = value instanceof Function ? value(storedValue) : value

        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(newValue))

        // Save state
        setStoredValue(newValue)

        // We dispatch a custom event so every useLocalStorage hook are notified
        window.dispatchEvent(new Event('local-storage'))
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue],
  )

  useEffect(() => {
    setStoredValue(readValue())
  }, [readValue])

  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue())
    }

    // This only works for other documents, not the current one
    window.addEventListener('storage', handleStorageChange)

    // This is a custom event, triggered in setValue
    window.addEventListener('local-storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('local-storage', handleStorageChange)
    }
  }, [readValue])

  return [storedValue, setValue]
}
