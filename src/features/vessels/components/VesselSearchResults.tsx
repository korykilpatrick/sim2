import { Vessel } from '../types/vessel'
import { cn } from '@/lib/utils'

interface VesselSearchResultsProps {
  results: Vessel[]
  selectedVessel: Vessel | null
  onSelectVessel: (vessel: Vessel) => void
}

export default function VesselSearchResults({
  results,
  selectedVessel,
  onSelectVessel,
}: VesselSearchResultsProps) {
  if (results.length === 0) return null

  return (
    <div className="border rounded-md divide-y">
      {results.map((vessel) => (
        <div
          key={vessel.id}
          className={cn(
            'p-4 cursor-pointer hover:bg-gray-50',
            selectedVessel?.id === vessel.id && 'bg-primary-50',
          )}
          onClick={() => onSelectVessel(vessel)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{vessel.name}</p>
              <p className="text-sm text-gray-500">
                IMO: {vessel.imo} | MMSI: {vessel.mmsi} | Flag: {vessel.flag}
              </p>
            </div>
            {selectedVessel?.id === vessel.id && (
              <svg
                className="h-5 w-5 text-primary-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
