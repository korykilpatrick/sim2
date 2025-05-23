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
  AreaStats,
  AreaAlerts,
  AreaSearch,
  AreaWizard,
} from '../components'
import { useAreaAlerts, useMarkAlertRead } from '../hooks/useAreaMonitoring'
import { PageLayout } from '@/components/layouts'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import Modal from '@/components/common/Modal'
import { Plus, MapPin } from 'lucide-react'
import type { Area, CreateAreaRequest } from '../types'

export default function AreaMonitoringPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  const [isCreating, setIsCreating] = useState(false)
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
  const alerts = alertsData?.data?.data || []

  const handleCreateArea = async (data: CreateAreaRequest) => {
    try {
      await createAreaMutation.mutateAsync(data)
      setIsCreating(false)
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
    <PageLayout
      title="Area Monitoring"
      subtitle="Monitor specific maritime areas of interest with real-time alerts"
      action={{
        label: 'Create New Area',
        onClick: () => setIsCreating(true),
        icon: <Plus className="h-5 w-5" />,
      }}
    >
      <div className="space-y-8">
        {/* Stats */}
        <AreaStats stats={stats} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Areas List */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <AreaSearch
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
              />
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
      </div>

      {/* Create Area Modal */}
      <Modal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        title="Create New Area"
        size="xl"
      >
        <AreaWizard
          onComplete={handleCreateArea}
          onCancel={() => setIsCreating(false)}
        />
      </Modal>

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
    </PageLayout>
  )
}