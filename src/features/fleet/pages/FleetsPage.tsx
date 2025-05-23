import { useState } from 'react'
import { Card, CardContent } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/forms/Input'
import { FleetStatsCard, FleetList } from '../components'
import { useFleets, useFleetStats, useSearchFleets } from '../hooks'
import type { Fleet, FleetTab } from '../types'
import { cn } from '@/lib/utils'

export default function FleetsPage() {
  const [activeTab, setActiveTab] = useState<FleetTab>('fleets')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch data
  const { data: fleets = [] } = useFleets()
  const { data: stats, isLoading: statsLoading } = useFleetStats()
  const { data: searchResults } = useSearchFleets(searchQuery)

  const displayedFleets = searchQuery ? searchResults || [] : fleets

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Tracking</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive fleet management and monitoring
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
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
            Create Fleet
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && <FleetStatsCard stats={stats} loading={statsLoading} />}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('fleets')}
            className={cn(
              activeTab === 'fleets'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
            )}
          >
            My Fleets
          </button>
          <button
            onClick={() => setActiveTab('vessels')}
            className={cn(
              activeTab === 'vessels'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
            )}
          >
            All Vessels
          </button>
        </nav>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="max-w-md">
            <Input
              type="search"
              placeholder={
                activeTab === 'fleets'
                  ? 'Search fleets...'
                  : 'Search vessels in fleets...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeTab === 'fleets' ? (
        <FleetList
          fleets={displayedFleets}
          onSelectFleet={(_fleet: Fleet) => {
            // TODO: Navigate to fleet detail page
          }}
          onEditFleet={(_fleet: Fleet) => {
            // TODO: Open edit modal
          }}
          onDeleteFleet={(_fleet: Fleet) => {
            // TODO: Confirm and delete
          }}
        />
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No vessels in fleets</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

