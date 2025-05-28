import { useState } from 'react'
import { creditService, useCreditStore } from '@/features/credits'
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
 * Hook for handling credit deductions when purchasing services
 * 
 * Provides credit deduction functionality with reservation support. Validates
 * sufficient balance, performs deductions, and updates local state. Also supports
 * credit reservation for multi-step workflows.
 * 
 * @returns {Object} Credit deduction utilities
 * @returns {Function} returns.deductCredits - Deduct credits from user balance
 * @returns {boolean} returns.isDeducting - Whether a deduction is in progress
 * @returns {Function} returns.reserveCredits - Reserve credits for later confirmation
 * @returns {Function} returns.confirmReservation - Confirm a credit reservation
 * @returns {Function} returns.cancelReservation - Cancel a credit reservation
 * 
 * @example
 * ```typescript
 * function PurchaseService({ service }: Props) {
 *   const { deductCredits, isDeducting } = useCreditDeduction()
 *   
 *   const handlePurchase = async () => {
 *     try {
 *       const result = await deductCredits(
 *         service.creditCost,
 *         `Purchase ${service.name}`
 *       )
 *       
 *       if (result.success) {
 *         showToast({ 
 *           type: 'success', 
 *           message: `Service purchased! New balance: ${result.newBalance}` 
 *         })
 *         router.push(`/services/${service.id}`)
 *       }
 *     } catch (error) {
 *       showToast({ 
 *         type: 'error', 
 *         message: error.message 
 *       })
 *     }
 *   }
 *   
 *   return (
 *     <button
 *       onClick={handlePurchase}
 *       disabled={isDeducting}
 *     >
 *       {isDeducting ? 'Processing...' : `Purchase (${service.creditCost} credits)`}
 *     </button>
 *   )
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Multi-step workflow with reservation
 * function MultiStepPurchase({ creditCost }: Props) {
 *   const { reserveCredits, confirmReservation, cancelReservation } = useCreditDeduction()
 *   const [reservationId, setReservationId] = useState<string | null>(null)
 *   
 *   // Step 1: Reserve credits
 *   const handleReserve = async () => {
 *     const reservation = await reserveCredits(creditCost, 'Multi-step service')
 *     setReservationId(reservation.reservationId)
 *   }
 *   
 *   // Step 2: Confirm or cancel
 *   const handleConfirm = async () => {
 *     if (reservationId) {
 *       await confirmReservation(reservationId)
 *       showToast({ type: 'success', message: 'Purchase completed!' })
 *     }
 *   }
 *   
 *   const handleCancel = async () => {
 *     if (reservationId) {
 *       await cancelReservation(reservationId)
 *       setReservationId(null)
 *     }
 *   }
 * }
 * ```
 */
export function useCreditDeduction() {
  const balance = useCreditStore((state) => state.balance)
  const updateBalance = useCreditStore((state) => state.updateBalance)
  const [isDeducting, setIsDeducting] = useState(false)
  const [reservations] = useState(new Map<string, CreditReservation>())

  const deductCredits = async (
    amount: number,
    description: string,
  ): Promise<DeductionResult> => {
    setIsDeducting(true)
    try {
      // Check sufficient balance first
      if (balance < amount) {
        throw new Error('Insufficient credits')
      }

      // Perform the deduction
      const response = await creditService.deductCredits({
        amount,
        description,
        serviceId: `service-${Date.now()}`,
        serviceType: 'vessel_tracking' as ServiceType, // Generic service type for now
      })

      // Update credit store with new balance
      updateBalance(response.newBalance)

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

  const reserveCredits = async (
    amount: number,
    _service: string,
  ): Promise<CreditReservation> => {
    const reservationId = `res-${Date.now()}`
    const reservation: CreditReservation = {
      reservationId,
      amount,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    }
    reservations.set(reservationId, reservation)
    return reservation
  }

  const confirmReservation = async (
    reservationId: string,
  ): Promise<DeductionResult> => {
    const reservation = reservations.get(reservationId)
    if (!reservation) {
      throw new Error('Reservation not found')
    }

    // Check if reservation expired
    if (new Date(reservation.expiresAt) < new Date()) {
      reservations.delete(reservationId)
      throw new Error('Reservation expired')
    }

    reservations.delete(reservationId)

    // Use the actual reservation amount
    return deductCredits(reservation.amount, 'Reserved service')
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
