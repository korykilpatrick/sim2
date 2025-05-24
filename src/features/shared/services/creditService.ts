import { apiClient } from '@/api/client'
import { ApiResponse } from '@/api/types'
import { useAuthStore } from '@/features/auth/services/authStore'
import {
  CreditBalance,
  CreditTransaction,
  CreditDeductionRequest,
  CreditDeductionResponse,
  ServiceType,
} from '../types'
import { CREDIT_COSTS } from '../utils/creditPricing'

/**
 * Service for managing user credits and credit-related operations.
 */
export const creditService = {
  /**
   * Gets the current user's credit balance details.
   *
   * @returns Credit balance information including available, lifetime, and expiring credits
   */
  async getBalance(): Promise<CreditBalance> {
    const response =
      await apiClient.get<ApiResponse<CreditBalance>>('/credits/balance')
    return response.data.data
  },

  /**
   * Gets the transaction history for the user's credits.
   *
   * @returns List of credit transactions
   */
  async getTransactions(): Promise<CreditTransaction[]> {
    const response = await apiClient.get<ApiResponse<CreditTransaction[]>>(
      '/credits/transactions',
    )
    return response.data.data
  },

  /**
   * Checks if the user has sufficient credits for a transaction.
   *
   * @param amount - Number of credits required
   * @returns True if user has sufficient balance
   */
  async checkSufficientCredits(amount: number): Promise<boolean> {
    const user = useAuthStore.getState().user
    return (user?.credits || 0) >= amount
  },

  /**
   * Deducts credits from the user's balance.
   *
   * @param request - Deduction request with amount and description
   * @returns Updated balance information
   */
  async deductCredits(
    request: CreditDeductionRequest,
  ): Promise<CreditDeductionResponse> {
    const response = await apiClient.post<ApiResponse<CreditDeductionResponse>>(
      '/credits/deduct',
      request,
    )
    return response.data.data
  },

  /**
   * Calculates the credit cost for a service based on parameters.
   *
   * @param service - Type of service
   * @param params - Service-specific parameters
   * @returns Calculated credit cost
   */
  calculateServiceCost(
    service: ServiceType,
    params: {
      criteria?: string[]
      days?: number
      areaSize?: number
      vesselCount?: number
      months?: number
      isComplex?: boolean
    },
  ): number {
    switch (service) {
      case 'vessel_tracking': {
        const { criteria = [], days = 1 } = params
        return (
          criteria.length *
          CREDIT_COSTS.VESSEL_TRACKING.PER_CRITERIA_PER_DAY *
          days
        )
      }

      case 'area_monitoring': {
        const { areaSize = 1000, days = 1 } = params
        const sizeMultiplier = areaSize <= 1000 ? 1 : areaSize <= 5000 ? 1.5 : 2
        return Math.ceil(
          CREDIT_COSTS.AREA_MONITORING.BASE_PER_DAY * sizeMultiplier * days,
        )
      }

      case 'fleet_tracking': {
        const { vesselCount = 0, months = 1 } = params
        return (
          CREDIT_COSTS.FLEET_TRACKING.PER_VESSEL_PER_MONTH *
          vesselCount *
          months
        )
      }

      case 'compliance_report':
        return CREDIT_COSTS.REPORTS.COMPLIANCE

      case 'chronology_report':
        return CREDIT_COSTS.REPORTS.CHRONOLOGY

      case 'investigation':
        return params.isComplex
          ? CREDIT_COSTS.INVESTIGATION.COMPLEX
          : CREDIT_COSTS.INVESTIGATION.STANDARD

      default:
        throw new Error(`Unknown service type: ${service}`)
    }
  },

  /**
   * Validates and reserves credits for a pending transaction.
   * This helps prevent race conditions when multiple services are purchased simultaneously.
   *
   * @param amount - Number of credits to reserve
   * @param serviceId - Unique identifier for the service
   * @returns Reservation ID for completing the transaction
   */
  async reserveCredits(amount: number, serviceId: string): Promise<string> {
    const response = await apiClient.post<
      ApiResponse<{ reservationId: string }>
    >('/credits/reserve', { amount, serviceId })
    return response.data.data.reservationId
  },

  /**
   * Completes a credit reservation by confirming the transaction.
   *
   * @param reservationId - ID from reserveCredits call
   * @returns Updated balance information
   */
  async confirmReservation(
    reservationId: string,
  ): Promise<CreditDeductionResponse> {
    const response = await apiClient.post<ApiResponse<CreditDeductionResponse>>(
      '/credits/confirm',
      { reservationId },
    )
    return response.data.data
  },

  /**
   * Cancels a credit reservation if the service creation fails.
   *
   * @param reservationId - ID from reserveCredits call
   */
  async cancelReservation(reservationId: string): Promise<void> {
    await apiClient.post('/credits/cancel', { reservationId })
  },
}
