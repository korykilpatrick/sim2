import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/services/authStore'
import { creditService } from '@/features/shared/services/creditService'
import type { CreditDeductionRequest } from '@/features/shared/types'

/**
 * Hook for handling credit deductions when purchasing services.
 * Validates sufficient balance and updates local state after deduction.
 *
 * @example
 * const { deductCredits } = useCreditDeduction();
 *
 * // Deduct credits for a service
 * await deductCredits({
 *   amount: 150,
 *   description: 'Vessel Tracking Service',
 *   serviceId: 'tracking_123'
 * });
 */
export function useCreditDeduction() {
  const updateCredits = useAuthStore((state) => state.updateCredits)
  const user = useAuthStore((state) => state.user)

  const deductCreditsMutation = useMutation({
    mutationFn: async (request: CreditDeductionRequest) => {
      // Check sufficient balance first
      const hasSufficientCredits = await creditService.checkSufficientCredits(
        request.amount,
      )
      if (!hasSufficientCredits) {
        throw new Error(
          `Insufficient credits. You need ${request.amount} credits but only have ${user?.credits || 0}.`,
        )
      }

      // Perform the deduction
      return creditService.deductCredits(request)
    },
    onSuccess: (response) => {
      // Update local auth store with new balance
      updateCredits(response.newBalance)
    },
  })

  return {
    deductCredits: deductCreditsMutation.mutateAsync,
    isDeducting: deductCreditsMutation.isPending,
    error: deductCreditsMutation.error,
  }
}
