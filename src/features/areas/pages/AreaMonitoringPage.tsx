import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useAreas,
  useCreateArea,
  useDeleteArea,
  useAreaStatistics,
} from '../hooks'
import {
  AreaList,
  AreaMap,
  AreaConfigForm,
  AreaStats,
  AreaAlerts,
} from '../components'
import { useAreaAlerts, useMarkAlertRead } from '../hooks/useAreaMonitoring'
import Button from '@/components/common/Button'
import Input from '@/components/forms/Input'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import Modal from '@/components/common/Modal'
import { Plus, Search, MapPin } from 'lucide-react'
import type { Area, CreateAreaRequest } from '../types'

export default function AreaMonitoringPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [currentAreaGeometry, setCurrentAreaGeometry] = useState<
    GeoJSON.Polygon | undefined
  >()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null)

  // Hooks
  const { data: areasData, isLoading: isLoadingAreas } = useAreas({
    search: searchQuery,
  })
  const { data: statsData, isLoading: isLoadingStats } = useAreaStatistics()
  const createAreaMutation = useCreateArea()
  const deleteAreaMutation = useDeleteArea()

  // Alerts for selected area
  const { data: alertsData } = useAreaAlerts(selectedArea?.id || '', {
    enabled: !!selectedArea,
  })
  const markAlertReadMutation = useMarkAlertRead()

  const areas = areasData?.data?.data || []
  const stats = statsData?.data?.data || {
    totalAreas: 0,
    activeMonitoring: 0,
    alertsToday: 0,
    creditsPerDay: 0,
    vesselsMonitored: 0,
    highRiskVessels: 0,
  }
  const alerts = alertsData?.data || []

  const handleCreateArea = async (data: CreateAreaRequest) => {
    try {
      await createAreaMutation.mutateAsync(data)
      setIsCreating(false)
      setCurrentAreaGeometry(undefined)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDeleteArea = async () => {
    if (!areaToDelete) return

    try {
      await deleteAreaMutation.mutateAsync(areaToDelete.id)
      setDeleteModalOpen(false)
      setAreaToDelete(null)
      if (selectedArea?.id === areaToDelete.id) {
        setSelectedArea(null)
      }
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleMarkAlertRead = (alertId: string) => {
    if (!selectedArea) return
    markAlertReadMutation.mutate({ areaId: selectedArea.id, alertId })
  }

  if (isLoadingAreas || isLoadingStats) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Area Monitoring</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor specific maritime areas of interest with real-time alerts
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Area
          </Button>
        </div>
      </div>

      {/* Stats */}
      <AreaStats stats={stats} />

      {/* Main Content */}
      {isCreating ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step 1: Define Area
            </h2>
            <AreaMap
              onAreaCreate={(geometry) => {
                setCurrentAreaGeometry(geometry)
              }}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Step 2: Configure Monitoring
            </h2>
            <AreaConfigForm
              area={currentAreaGeometry}
              areaSize={100} // Calculate from geometry in real implementation
              onSubmit={handleCreateArea}
              onCancel={() => {
                setIsCreating(false)
                setCurrentAreaGeometry(undefined)
              }}
              isSubmitting={createAreaMutation.isPending}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Areas List */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search areas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <AreaList
              areas={areas}
              selectedAreaId={selectedArea?.id}
              onSelectArea={setSelectedArea}
              onEditArea={(area) => {
                // Navigate to edit page or open edit modal
                navigate(`/areas/${area.id}/edit`)
              }}
              onDeleteArea={(area) => {
                setAreaToDelete(area)
                setDeleteModalOpen(true)
              }}
            />
          </div>

          {/* Map and Alerts */}
          <div className="lg:col-span-2 space-y-6">
            {selectedArea ? (
              <>
                <AreaMap
                  area={selectedArea.geometry}
                  vesselsInArea={[]} // Would fetch from API
                />
                <AreaAlerts
                  alerts={alerts}
                  onMarkRead={handleMarkAlertRead}
                />
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  Select an area to view details
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Area"
      >
        <p className="text-gray-600">
          Are you sure you want to delete "{areaToDelete?.name}"? This will stop
          all monitoring and remove all associated data.
        </p>
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteArea}
            loading={deleteAreaMutation.isPending}
          >
            Delete Area
          </Button>
        </div>
      </Modal>
    </div>
  )
}