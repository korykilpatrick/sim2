import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { vesselsApi } from '../services/vessels'
import { vesselKeys } from '../hooks'
import type { VesselTracking } from '../types'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import VesselTrackingCardRealtime from '../components/VesselTrackingCardRealtime'
import EmptyTrackingState from '../components/EmptyTrackingState'
import VesselSearchBar from '../components/VesselSearchBar'

export default function VesselsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: trackings, isLoading } = useQuery({
    queryKey: vesselKeys.trackings(),
    queryFn: () => vesselsApi.getMyTrackings(),
  })

  const activeTrackings =
    trackings?.items?.filter((t: VesselTracking) => t.status === 'active') || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vessel Tracking</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor individual vessels with customizable alerts
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link to="/vessels/track">
            <Button>
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Track New Vessel
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <VesselSearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* Active Trackings */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Active Vessel Tracking ({activeTrackings.length})
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : activeTrackings.length === 0 ? (
          <EmptyTrackingState />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeTrackings.map((tracking: VesselTracking) => (
              <VesselTrackingCardRealtime
                key={tracking.id}
                tracking={tracking}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
