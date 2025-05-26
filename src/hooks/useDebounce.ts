import { useEffect, useState } from 'react'

/**
 * Debounces a value by delaying updates until after wait milliseconds have elapsed
 * since the last time the debounced value was updated
 * 
 * @template T - The type of the value being debounced
 * @param {T} value - The value to debounce
 * @param {number} delay - The number of milliseconds to delay
 * @returns {T} The debounced value
 * 
 * @example
 * ```typescript
 * function SearchComponent() {
 *   const [searchTerm, setSearchTerm] = useState('')
 *   const debouncedSearch = useDebounce(searchTerm, 500)
 *   
 *   // API call only triggers after user stops typing for 500ms
 *   useEffect(() => {
 *     if (debouncedSearch) {
 *       searchAPI(debouncedSearch)
 *     }
 *   }, [debouncedSearch])
 *   
 *   return (
 *     <input
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   )
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
