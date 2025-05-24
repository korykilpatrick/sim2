import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { vesselsApi } from '../services/vessels'
import { PageLayout } from '@/components/layouts'
import {
  TrackingWizard,
  TrackingWizardData,
} from '../components/tracking-wizard'
import { useCreditDeduction } from '@/features/shared/hooks'
import { creditService } from '@/features/shared/services'
import { differenceInDays } from '@/utils/date'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/api/types'

export default function VesselTrackingPage() {
  const navigate = useNavigate()
  const { deductCredits } = useCreditDeduction()

  // Create tracking mutation
  const createTrackingMutation = useMutation({
    mutationFn: async (data: {
      vesselId: string
      criteria: string[]
      endDate: string
      creditCost: number
    }) => {
      // First deduct credits
      await deductCredits({
        amount: data.creditCost,
        description: `Vessel tracking for ${data.criteria.length} criteria`,
        serviceId: `tracking_${data.vesselId}_${Date.now()}`,
        serviceType: 'vessel_tracking',
        metadata: {
          vesselId: data.vesselId,
          criteria: data.criteria,
          endDate: data.endDate,
        },
      })

      // Then create the tracking
      return vesselsApi.createTracking({
        vesselId: data.vesselId,
        criteria: data.criteria,
        endDate: data.endDate,
      })
    },
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

    // Calculate credit cost
    const days = differenceInDays(new Date(data.endDate), new Date()) + 1
    const creditCost = creditService.calculateServiceCost('vessel_tracking', {
      criteria: data.criteria,
      days,
    })

    // Check if user has sufficient credits
    const hasSufficientCredits =
      await creditService.checkSufficientCredits(creditCost)
    if (!hasSufficientCredits) {
      toast.error(
        `Insufficient credits. This tracking requires ${creditCost} credits.`,
      )
      return
    }

    await createTrackingMutation.mutateAsync({
      vesselId: data.vessel.id,
      criteria: data.criteria,
      endDate: data.endDate,
      creditCost,
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
