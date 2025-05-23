import { Card, CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import type { Fleet } from '../types'

interface FleetListProps {
  fleets: Fleet[]
  onSelectFleet?: (fleet: Fleet) => void
  onEditFleet?: (fleet: Fleet) => void
  onDeleteFleet?: (fleet: Fleet) => void
}

export function FleetList({
  fleets,
  onSelectFleet,
  onEditFleet,
  onDeleteFleet,
}: FleetListProps) {
  if (fleets.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No fleets created
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first fleet to start monitoring multiple vessels
          </p>
          <div className="mt-6">
            <Button variant="primary">Create Fleet</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {fleets.map((fleet) => (
        <Card
          key={fleet.id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSelectFleet?.(fleet)}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {fleet.name}
              </h3>
              <div className="flex space-x-2">
                {onEditFleet && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditFleet(fleet)
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                )}
                {onDeleteFleet && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteFleet(fleet)
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            {fleet.description && (
              <p className="text-sm text-gray-500 mb-4">{fleet.description}</p>
            )}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Vessels</span>
                <span className="font-medium">{fleet.vesselCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active Alerts</span>
                <span className="font-medium text-red-600">
                  {fleet.activeAlerts}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Credits/Month</span>
                <span className="font-medium">{fleet.creditsPerMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
