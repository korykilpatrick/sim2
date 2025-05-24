import React from 'react'
import { useVesselSearch, VesselSearchInput } from '../vessel-search'
import type { Vessel } from '../../types'

interface VesselSelectionStepProps {
  initialVessel?: Vessel | null
  onVesselSelect: (vessel: Vessel | null) => void
}

export function VesselSelectionStep({
  initialVessel,
  onVesselSelect,
}: VesselSelectionStepProps) {
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    selectedVessel,
    selectVessel,
    clearSelection,
    error,
  } = useVesselSearch()

  React.useEffect(() => {
    if (initialVessel) {
      selectVessel(initialVessel)
    }
  }, [initialVessel, selectVessel])

  React.useEffect(() => {
    onVesselSelect(selectedVessel)
  }, [selectedVessel, onVesselSelect])

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-medium text-gray-900 mb-2">
          Find the vessel you want to track
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Search by vessel name, IMO number, or MMSI
        </p>
      </div>

      <VesselSearchInput
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchResults={searchResults}
        isSearching={isSearching}
        selectedVessel={selectedVessel}
        onSelectVessel={selectVessel}
        onClearSelection={clearSelection}
        error={error}
        required
      />
    </div>
  )
}
