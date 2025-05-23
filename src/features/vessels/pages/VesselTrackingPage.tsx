import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { vesselsApi } from '../services/vessels'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/forms/Input'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'
import VesselSearchResults from '../components/VesselSearchResults'
import CriteriaSelector from '../components/CriteriaSelector'
import TrackingCostSummary from '../components/TrackingCostSummary'

interface TrackingFormData {
  vesselSearch: string
  endDate: string
  criteria: string[]
}

export default function VesselTrackingPage() {
  const navigate = useNavigate()
  const [selectedVessel, setSelectedVessel] = useState<any>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([])
  const [trackingDays, setTrackingDays] = useState(30)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackingFormData>()

  // Get available criteria
  const { data: criteriaData, isLoading: isLoadingCriteria } = useQuery({
    queryKey: ['tracking-criteria'],
    queryFn: () => vesselsApi.getTrackingCriteria(),
  })

  // Calculate cost when criteria or days change
  const { data: costData } = useQuery({
    queryKey: [
      'tracking-cost',
      selectedVessel?.id,
      selectedCriteria,
      trackingDays,
    ],
    queryFn: () =>
      vesselsApi.calculateCost({
        vesselId: selectedVessel.id,
        criteria: selectedCriteria,
        days: trackingDays,
      }),
    enabled: !!selectedVessel && selectedCriteria.length > 0,
  })

  // Search vessels
  const searchVessels = async (query: string) => {
    if (query.length < 3) return

    setIsSearching(true)
    try {
      const response = await vesselsApi.searchVessels({ query })
      setSearchResults(response.data || [])
    } catch (error) {
      toast.error('Failed to search vessels')
    } finally {
      setIsSearching(false)
    }
  }

  // Create tracking mutation
  const createTrackingMutation = useMutation({
    mutationFn: (data: any) => vesselsApi.createTracking(data),
    onSuccess: () => {
      toast.success('Vessel tracking created successfully!')
      navigate('/vessels')
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to create tracking',
      )
    },
  })

  const onSubmit = (data: TrackingFormData) => {
    if (!selectedVessel) {
      toast.error('Please select a vessel')
      return
    }

    if (selectedCriteria.length === 0) {
      toast.error('Please select at least one tracking criteria')
      return
    }

    createTrackingMutation.mutate({
      vesselId: selectedVessel.id,
      criteria: selectedCriteria,
      endDate: data.endDate,
    })
  }

  const toggleCriteria = (criteriaId: string) => {
    setSelectedCriteria((prev) =>
      prev.includes(criteriaId)
        ? prev.filter((id) => id !== criteriaId)
        : [...prev, criteriaId],
    )
  }

  const criteria = criteriaData?.data || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Track New Vessel</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up customized tracking for a specific vessel
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Search Vessel */}
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Vessel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Search for vessel"
                placeholder="Enter vessel name, IMO, or MMSI..."
                {...register('vesselSearch', {
                  required: 'Please search for a vessel',
                })}
                onChange={(e) => searchVessels(e.target.value)}
                error={errors.vesselSearch?.message}
              />

              {isSearching && (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              )}

              <VesselSearchResults
                results={searchResults}
                selectedVessel={selectedVessel}
                onSelectVessel={setSelectedVessel}
              />

              {selectedVessel && (
                <div className="bg-primary-50 border border-primary-200 rounded-md p-4">
                  <p className="text-sm font-medium text-primary-900">
                    Selected Vessel:
                  </p>
                  <p className="text-sm text-primary-700">
                    {selectedVessel.name}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Select Criteria */}
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Select Tracking Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCriteria ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <CriteriaSelector
                criteria={criteria}
                selectedCriteria={selectedCriteria}
                onToggleCriteria={toggleCriteria}
              />
            )}
          </CardContent>
        </Card>

        {/* Step 3: Configure Duration */}
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Configure Tracking Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tracking Duration (days)"
                  type="number"
                  min="1"
                  max="365"
                  value={trackingDays}
                  onChange={(e) => setTrackingDays(Number(e.target.value))}
                />
                <Input
                  label="End Date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register('endDate', { required: 'End date is required' })}
                  error={errors.endDate?.message}
                />
              </div>

              {costData && (
                <TrackingCostSummary
                  creditsPerDay={costData.data.creditsPerDay}
                  totalCredits={costData.data.totalCredits}
                  trackingDays={trackingDays}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/vessels')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createTrackingMutation.isPending}
            disabled={!selectedVessel || selectedCriteria.length === 0}
          >
            Start Tracking
          </Button>
        </div>
      </form>
    </div>
  )
}
