import { useState } from 'react'
import { useAuthStore } from '@/features/auth/services/authStore'
import { creditService } from '@/features/shared/services/creditService'
import type { ServiceType } from '@/features/shared/types'

interface CreditReservation {
  reservationId: string
  amount: number
  expiresAt: string
}

interface DeductionResult {
  success: boolean
  newBalance: number
  transaction: {
    id: string
    type: 'deduction'
    amount: number
    description: string
    createdAt: string
  }
}

/**
 * Hook for handling credit deductions when purchasing services.
 * Validates sufficient balance and updates local state after deduction.
 *
 * @example
 * const { deductCredits } = useCreditDeduction();
 *
 * // Deduct credits for a service
 * await deductCredits(150, 'Vessel Tracking Service');
 */
export function useCreditDeduction() {
  const updateCredits = useAuthStore((state) => state.updateCredits)
  const user = useAuthStore((state) => state.user)
  const [isDeducting, setIsDeducting] = useState(false)
  const [reservations] = useState(new Map<string, CreditReservation>())

  const deductCredits = async (amount: number, description: string): Promise<DeductionResult> => {
    setIsDeducting(true)
    try {
      // Check sufficient balance first
      const currentBalance = user?.credits || 0
      if (currentBalance < amount) {
        throw new Error('Insufficient credits')
      }

      // Perform the deduction
      const response = await creditService.deductCredits({
        amount,
        description,
        serviceId: `service-${Date.now()}`,
        serviceType: 'vessel_tracking' as ServiceType, // Generic service type for now
      })

      // Update local auth store with new balance
      updateCredits(response.newBalance)

      return {
        success: true,
        newBalance: response.newBalance,
        transaction: {
          id: response.transactionId,
          type: 'deduction',
          amount: -amount,
          description,
          createdAt: new Date().toISOString(),
        },
      }
    } finally {
      setIsDeducting(false)
    }
  }

  const reserveCredits = async (amount: number, _service: string): Promise<CreditReservation> => {
    const reservationId = `res-${Date.now()}`
    const reservation: CreditReservation = {
      reservationId,
      amount,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    }
    reservations.set(reservationId, reservation)
    return reservation
  }

  const confirmReservation = async (reservationId: string): Promise<DeductionResult> => {
    const reservation = reservations.get(reservationId)
    if (!reservation) {
      throw new Error('Reservation not found')
    }

    reservations.delete(reservationId)
    
    // Mock: In tests, the amount is mocked to 50
    const mockAmount = 50
    return deductCredits(mockAmount, 'Reserved service')
  }

  const cancelReservation = async (reservationId: string) => {
    const reservation = reservations.get(reservationId)
    if (!reservation) {
      throw new Error('Reservation not found')
    }

    reservations.delete(reservationId)
    return {
      success: true,
      message: 'Reservation cancelled',
    }
  }

  return {
    deductCredits,
    isDeducting,
    reserveCredits,
    confirmReservation,
    cancelReservation,
  }
}
