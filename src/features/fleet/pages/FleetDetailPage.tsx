import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Search,
  Ship,
  AlertCircle,
  Calendar,
  CreditCard,
} from 'lucide-react'
import Button from '@components/common/Button'
import { Card } from '@components/common/Card'
import Input from '@components/forms/Input'
import Table from '@components/common/Table'
import LoadingSpinner from '@components/feedback/LoadingSpinner'
import Alert from '@components/feedback/Alert'
import Modal from '@components/common/Modal'
import { useFleetVessels } from '../hooks/useFleetVessels'
import { useFleet } from '../hooks/useFleets'
import { useVesselSearch } from '@features/vessels/hooks/useVesselSearch'
import { fleetService } from '../services/fleetService'
import { useToast } from '@/hooks'
import { formatPrice } from '@utils/formatPrice'
import { format } from 'date-fns'

export default function FleetDetailPage() {
  const { fleetId } = useParams<{ fleetId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [isAddVesselModalOpen, setIsAddVesselModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVessels, setSelectedVessels] = useState<string[]>([])

  const { data: fleet, isLoading: isLoadingFleet } = useFleet(fleetId!)
  const {
    data: fleetVessels,
    isLoading: isLoadingVessels,
    refetch: refetchVessels,
  } = useFleetVessels(fleetId!)

  const vesselSearch = useVesselSearch()

  // Use the search hook
  useEffect(() => {
    vesselSearch.setSearchTerm(searchQuery)
  }, [searchQuery])

  const handleAddVessels = async () => {
    if (selectedVessels.length === 0) return

    try {
      for (const vesselId of selectedVessels) {
        await fleetService.addVesselToFleet({
          fleetId: fleetId!,
          vesselId,
        })
      }

      showToast({
        type: 'success',
        message: `Added ${selectedVessels.length} vessel(s) to fleet`,
      })
      setIsAddVesselModalOpen(false)
      setSelectedVessels([])
      setSearchQuery('')
      refetchVessels()
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to add vessels to fleet',
      })
    }
  }

  const handleRemoveVessel = async (vesselId: string) => {
    try {
      await fleetService.removeVesselFromFleet({
        fleetId: fleetId!,
        vesselId,
      })
      showToast({
        type: 'success',
        message: 'Vessel removed from fleet',
      })
      refetchVessels()
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to remove vessel from fleet',
      })
    }
  }

  const toggleVesselSelection = (vesselId: string) => {
    setSelectedVessels((prev) =>
      prev.includes(vesselId)
        ? prev.filter((id) => id !== vesselId)
        : [...prev, vesselId],
    )
  }

  if (isLoadingFleet || isLoadingVessels) {
    return <LoadingSpinner size="lg" className="mx-auto mt-8" />
  }

  if (!fleet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error" message="Fleet not found" />
      </div>
    )
  }

  const availableVessels = vesselSearch.searchResults.filter(
    (vessel) => !fleetVessels?.some((fv) => fv.id === vessel.id),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/fleets')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Fleets
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{fleet.name}</h1>
            {fleet.description && (
              <p className="text-gray-600 mt-2">{fleet.description}</p>
            )}
          </div>

          <Button
            onClick={() => setIsAddVesselModalOpen(true)}
            variant="primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vessels
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Ship className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Vessels</p>
              <p className="text-2xl font-bold">{fleet.vesselCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold">{fleet.activeAlerts || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Credits/Month</p>
              <p className="text-2xl font-bold">
                {formatPrice(fleet.creditsPerMonth)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="text-lg font-semibold">
                {format(new Date(fleet.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Vessels Table */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Fleet Vessels</h2>

          {fleetVessels && fleetVessels.length > 0 ? (
            <Table
              columns={[
                { key: 'name', header: 'Vessel Name', accessor: (v) => v.name },
                { key: 'imo', header: 'IMO', accessor: (v) => v.imo },
                { key: 'type', header: 'Type', accessor: (v) => v.type },
                { key: 'flag', header: 'Flag', accessor: (v) => v.flag },
                { 
                  key: 'status', 
                  header: 'Status', 
                  accessor: (v) => (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        v.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {v.status}
                    </span>
                  )
                },
                { 
                  key: 'actions', 
                  header: 'Actions', 
                  accessor: (v) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVessel(v.id)}
                    >
                      Remove
                    </Button>
                  )
                },
              ]}
              data={fleetVessels}
              keyExtractor={(vessel) => vessel.id}
            />
          ) : (
            <div className="text-center py-12">
              <Ship className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No vessels in this fleet</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => setIsAddVesselModalOpen(true)}
              >
                Add First Vessel
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Add Vessel Modal */}
      <Modal
        isOpen={isAddVesselModalOpen}
        onClose={() => {
          setIsAddVesselModalOpen(false)
          setSelectedVessels([])
          setSearchQuery('')
        }}
        title="Add Vessels to Fleet"
        size="lg"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search vessels by name, IMO, or MMSI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {vesselSearch.isSearching ? (
            <LoadingSpinner className="mx-auto" />
          ) : availableVessels.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {availableVessels.map((vessel) => (
                  <div
                    key={vessel.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedVessels.includes(vessel.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleVesselSelection(vessel.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{vessel.name}</h4>
                        <p className="text-sm text-gray-600">
                          IMO: {vessel.imo} • Type: {vessel.type} • Flag:{' '}
                          {vessel.flag}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedVessels.includes(vessel.id)}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : searchQuery ? (
            <p className="text-center text-gray-500 py-8">
              No available vessels found matching "{searchQuery}"
            </p>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Search for vessels to add to this fleet
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddVesselModalOpen(false)
                setSelectedVessels([])
                setSearchQuery('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddVessels}
              disabled={selectedVessels.length === 0}
            >
              Add {selectedVessels.length} Vessel
              {selectedVessels.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
