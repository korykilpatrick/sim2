import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { vesselsApi } from '../services/vessels'
import { Vessel } from '../types/vessel'

/**
 * Hook for searching vessels by name, IMO, or MMSI.
 * Provides search functionality with loading state and error handling.
 * 
 * @returns Search state and methods
 * 
 * @example
 * const { searchVessels, searchResults, isSearching } = useVesselSearch();
 * 
 * // Perform search
 * await searchVessels('Vessel Name');
 * 
 * // Display results
 * searchResults.map(vessel => console.log(vessel.name));
 */
export function useVesselSearch() {
  const [searchResults, setSearchResults] = useState<Vessel[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const searchVessels = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await vesselsApi.searchVessels({ query })
      setSearchResults(response.data || [])
    } catch (error) {
      toast.error('Failed to search vessels')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  return {
    searchResults,
    isSearching,
    searchVessels,
  }
}
