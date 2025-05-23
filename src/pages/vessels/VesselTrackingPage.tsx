import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { vesselsApi } from '@/api/vessels'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import LoadingSpinner from '@/components/feedback/LoadingSpinner'

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

  const { register, handleSubmit, formState: { errors } } = useForm<TrackingFormData>()

  // Get available criteria
  const { data: criteriaData, isLoading: isLoadingCriteria } = useQuery({
    queryKey: ['tracking-criteria'],
    queryFn: () => vesselsApi.getTrackingCriteria(),
  })

  // Calculate cost when criteria or days change
  const { data: costData } = useQuery({
    queryKey: ['tracking-cost', selectedVessel?.id, selectedCriteria, trackingDays],
    queryFn: () => vesselsApi.calculateCost({
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
      toast.error(error.response?.data?.error?.message || 'Failed to create tracking')
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
    setSelectedCriteria(prev =>
      prev.includes(criteriaId)
        ? prev.filter(id => id !== criteriaId)
        : [...prev, criteriaId]
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
                {...register('vesselSearch', { required: 'Please search for a vessel' })}
                onChange={(e) => searchVessels(e.target.value)}
                error={errors.vesselSearch?.message}
              />

              {isSearching && (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="border rounded-md divide-y">
                  {searchResults.map((vessel) => (
                    <div
                      key={vessel.id}
                      className={clsx(
                        'p-4 cursor-pointer hover:bg-gray-50',
                        selectedVessel?.id === vessel.id && 'bg-primary-50'
                      )}
                      onClick={() => setSelectedVessel(vessel)}
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
              )}

              {selectedVessel && (
                <div className="bg-primary-50 border border-primary-200 rounded-md p-4">
                  <p className="text-sm font-medium text-primary-900">Selected Vessel:</p>
                  <p className="text-sm text-primary-700">{selectedVessel.name}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {criteria.map((criterion) => (
                  <div
                    key={criterion.id}
                    className={clsx(
                      'border rounded-lg p-4 cursor-pointer transition-all',
                      selectedCriteria.includes(criterion.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    )}
                    onClick={() => toggleCriteria(criterion.id)}
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={selectedCriteria.includes(criterion.id)}
                        onChange={() => toggleCriteria(criterion.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">{criterion.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{criterion.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Estimated Cost</p>
                      <p className="text-sm text-gray-500">
                        {costData.data.creditsPerDay} credits/day × {trackingDays} days
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {costData.data.totalCredits}
                      </p>
                      <p className="text-sm text-gray-500">total credits</p>
                    </div>
                  </div>
                </div>
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

function clsx(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}