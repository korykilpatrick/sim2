import { useState, useCallback, useEffect } from 'react'
import { vesselsApi } from '../services/vessels'
import { useDebounce } from '@/hooks'
import type { Vessel } from '../types'

/**
 * Return type for the useVesselSearch hook
 */
interface UseVesselSearchReturn {
  /** Current search term entered by the user */
  searchTerm: string
  /** Function to update the search term */
  setSearchTerm: (term: string) => void
  /** Array of vessels matching the search criteria */
  searchResults: Vessel[]
  /** Whether a search is currently in progress */
  isSearching: boolean
  /** Currently selected vessel (if any) */
  selectedVessel: Vessel | null
  /** Function to select a vessel from search results */
  selectVessel: (vessel: Vessel) => void
  /** Function to clear the current selection and search */
  clearSelection: () => void
  /** Error message if search fails */
  error: string | null
}

/**
 * Hook for searching and selecting vessels with debounced input
 * 
 * Provides a complete vessel search interface with automatic debouncing,
 * loading states, error handling, and selection management. Searches are
 * triggered automatically as the user types (after debounce delay).
 * 
 * @param {number} minSearchLength - Minimum characters required to trigger search (default: 3)
 * @returns {UseVesselSearchReturn} Object containing search state and controls
 * 
 * @example
 * ```typescript
 * function VesselSearchInput() {
 *   const {
 *     searchTerm,
 *     setSearchTerm,
 *     searchResults,
 *     isSearching,
 *     selectedVessel,
 *     selectVessel
 *   } = useVesselSearch()
 *   
 *   return (
 *     <div>
 *       <input
 *         value={searchTerm}
 *         onChange={(e) => setSearchTerm(e.target.value)}
 *         placeholder="Search vessels..."
 *       />
 *       
 *       {isSearching && <Spinner />}
 *       
 *       {searchResults.map(vessel => (
 *         <button
 *           key={vessel.id}
 *           onClick={() => selectVessel(vessel)}
 *         >
 *           {vessel.name} ({vessel.imo})
 *         </button>
 *       ))}
 *       
 *       {selectedVessel && (
 *         <div>Selected: {selectedVessel.name}</div>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Custom minimum search length
 * const { searchTerm, setSearchTerm } = useVesselSearch(2)
 * 
 * // Search will trigger after 2 characters instead of 3
 * ```
 */
export function useVesselSearch(minSearchLength = 3): UseVesselSearchReturn {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Vessel[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null)
  const [error, setError] = useState<string | null>(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const searchVessels = useCallback(
    async (query: string) => {
      if (query.length < minSearchLength) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      setError(null)

      try {
        const response = await vesselsApi.searchVessels({ query })
        setSearchResults(response.items || [])
      } catch (err) {
        setError('Failed to search vessels')
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [minSearchLength],
  )

  const selectVessel = useCallback((vessel: Vessel) => {
    setSelectedVessel(vessel)
    setSearchResults([])
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedVessel(null)
    setSearchTerm('')
    setSearchResults([])
  }, [])

  // Effect to trigger search when debounced term changes
  useEffect(() => {
    searchVessels(debouncedSearchTerm)
  }, [debouncedSearchTerm, searchVessels])

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    selectedVessel,
    selectVessel,
    clearSelection,
    error,
  }
}
