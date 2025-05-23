import { useState } from 'react'
import { VesselSearchInput } from '@/features/vessels/components/vessel-search'
import { useVesselSearch } from '@/features/vessels/hooks'
import { Card } from '@/components/common'
import { Ship, AlertCircle } from 'lucide-react'
import type { Vessel } from '@/features/vessels/types'

interface VesselSelectionStepProps {
  selectedVessel: Vessel | null
  onSelectVessel: (vessel: Vessel) => void
}

export function VesselSelectionStep({
  selectedVessel,
  onSelectVessel,
}: VesselSelectionStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const { searchResults, isSearching } = useVesselSearch(searchTerm)

  return (
    <div className="space-y-6">
      <VesselSearchInput
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchResults={searchResults}
        isSearching={isSearching}
        selectedVessel={selectedVessel}
        onSelectVessel={onSelectVessel}
        placeholder="Search by vessel name, IMO, or MMSI..."
        label="Search for vessel"
      />

      {selectedVessel && (
        <Card className="bg-primary-50 border-primary-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Ship className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-primary-900">
                Selected Vessel
              </h4>
              <p className="mt-1 text-sm text-primary-700">
                {selectedVessel.name}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-primary-600">
                  IMO: {selectedVessel.imo}
                </p>
                <p className="text-xs text-primary-600">
                  Flag: {selectedVessel.flag}
                </p>
                <p className="text-xs text-primary-600">
                  Type: {selectedVessel.type}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {!selectedVessel && (
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">
                Search and select a vessel to generate reports for. You can search
                by vessel name, IMO number, or MMSI.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}