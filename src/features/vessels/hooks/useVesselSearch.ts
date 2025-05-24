import { useState, useCallback, useEffect } from 'react';
import { vesselsApi } from '../services/vessels';
import { useDebounce } from '@/components/search';
import type { Vessel } from '../types';

interface UseVesselSearchReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: Vessel[];
  isSearching: boolean;
  selectedVessel: Vessel | null;
  selectVessel: (vessel: Vessel) => void;
  clearSelection: () => void;
  error: string | null;
}

export function useVesselSearch(minSearchLength = 3): UseVesselSearchReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Vessel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const searchVessels = useCallback(async (query: string) => {
    if (query.length < minSearchLength) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      const response = await vesselsApi.searchVessels({ query });
      setSearchResults(response.data || []);
    } catch (err) {
      setError('Failed to search vessels');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [minSearchLength]);

  const selectVessel = useCallback((vessel: Vessel) => {
    setSelectedVessel(vessel);
    setSearchResults([]);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedVessel(null);
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  // Effect to trigger search when debounced term changes
  useEffect(() => {
    searchVessels(debouncedSearchTerm);
  }, [debouncedSearchTerm, searchVessels]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    selectedVessel,
    selectVessel,
    clearSelection,
    error,
  };
}