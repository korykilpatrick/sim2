import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@components/common/Card'
import Button from '@components/common/Button'
import Input from '@components/forms/Input'
import {
  FleetStats,
  FleetList,
  CreateFleetModal,
  EditFleetModal,
} from '../components'
import { useFleets, useDeleteFleet } from '../hooks/useFleets'
import { useToast } from '@/hooks'
import type { Fleet } from '../types'
import { cn } from '@utils/cn'

type FleetTab = 'fleets' | 'vessels'

export default function FleetsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const deleteFleet = useDeleteFleet()

  const [activeTab, setActiveTab] = useState<FleetTab>('fleets')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null)

  // Fetch data
  const { data: fleets = [] } = useFleets()
  const filteredFleets = searchQuery
    ? fleets.filter(
        (fleet) =>
          fleet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fleet.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : fleets

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
          <Button onClick={() => setIsCreateModalOpen(true)}>
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
      <FleetStats />

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
      <Card className="p-6">
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
      </Card>

      {/* Content */}
      {activeTab === 'fleets' ? (
        <FleetList
          fleets={filteredFleets}
          onSelectFleet={(fleet: Fleet) => {
            navigate(`/fleets/${fleet.id}`)
          }}
          onEditFleet={(fleet: Fleet) => {
            setSelectedFleet(fleet)
            setIsEditModalOpen(true)
          }}
          onDeleteFleet={(fleet: Fleet) => {
            if (
              confirm(
                `Are you sure you want to delete the fleet "${fleet.name}"? This action cannot be undone.`,
              )
            ) {
              deleteFleet.mutate(fleet.id, {
                onSuccess: () => {
                  showToast({
                    type: 'success',
                    message: 'Fleet deleted successfully',
                  })
                },
                onError: () => {
                  showToast({
                    type: 'error',
                    message: 'Failed to delete fleet',
                  })
                },
              })
            }
          }}
        />
      ) : (
        <Card className="text-center py-12">
          <p className="text-gray-500">No vessels in fleets</p>
        </Card>
      )}

      {/* Create Fleet Modal */}
      <CreateFleetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          // Fleets will be refetched automatically via React Query
        }}
      />

      {/* Edit Fleet Modal */}
      <EditFleetModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedFleet(null)
        }}
        fleet={selectedFleet}
        onSuccess={() => {
          setIsEditModalOpen(false)
          setSelectedFleet(null)
          // Fleets will be refetched automatically via React Query
        }}
      />
    </div>
  )
}
