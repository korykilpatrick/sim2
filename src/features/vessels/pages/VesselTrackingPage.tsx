import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { vesselsApi } from '../services/vessels'
import { PageLayout } from '@/components/layouts'
import { TrackingWizard, TrackingWizardData } from '../components/tracking-wizard'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/types/api'

export default function VesselTrackingPage() {
  const navigate = useNavigate()

  // Create tracking mutation
  const createTrackingMutation = useMutation({
    mutationFn: (data: {
      vesselId: string
      criteria: string[]
      endDate: string
    }) => vesselsApi.createTracking(data),
    onSuccess: () => {
      toast.success('Vessel tracking created successfully!')
      navigate('/vessels')
    },
    onError: (error: AxiosError<ApiResponse>) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to create tracking',
      )
    },
  })

  const handleComplete = async (data: TrackingWizardData) => {
    if (!data.vessel) {
      toast.error('Please select a vessel')
      return
    }

    if (data.criteria.length === 0) {
      toast.error('Please select at least one tracking criteria')
      return
    }

    await createTrackingMutation.mutateAsync({
      vesselId: data.vessel.id,
      criteria: data.criteria,
      endDate: data.endDate,
    })
  }

  return (
    <PageLayout
      title="Track New Vessel"
      subtitle="Set up customized tracking for a specific vessel"
      backButton
      backTo="/vessels"
    >
      <TrackingWizard onComplete={handleComplete} />
    </PageLayout>
  )
}
