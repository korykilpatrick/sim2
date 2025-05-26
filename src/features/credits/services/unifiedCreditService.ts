/**
 * Unified Credit Service
 * 
 * This service combines the functionality of both credit implementations
 * and serves as the single source of truth for all credit operations.
 */

import { apiClient } from '@/api/client'
import { ApiResponse } from '@/api/types'
import { useAuthStore } from '@/features/auth/services/authStore'
import {
  CreditBalance,
  CreditTransaction,
  CreditDeductionRequest,
  CreditDeductionResponse,
  CreditPurchaseRequest,
  CreditPurchaseResponse,
  CreditTransactionFilter,
  CreditCostCalculationParams,
  CREDIT_PACKAGES,
} from '../types'
import { CREDIT_COSTS } from '@/features/shared/utils/creditPricing'

class UnifiedCreditService {
  /**
   * Gets the current user's credit balance details.
   */
  async getBalance(): Promise<CreditBalance> {
    const response = await apiClient.get<ApiResponse<CreditBalance>>('/credits/balance')
    return response.data.data
  }

  /**
   * Gets the transaction history with optional filtering.
   */
  async getTransactionHistory(filter?: CreditTransactionFilter): Promise<CreditTransaction[]> {
    const params = new URLSearchParams()
    
    if (filter?.limit) params.append('limit', filter.limit.toString())
    if (filter?.offset) params.append('offset', filter.offset.toString())
    if (filter?.type) params.append('type', filter.type)
    if (filter?.startDate) params.append('startDate', filter.startDate)
    if (filter?.endDate) params.append('endDate', filter.endDate)
    
    const response = await apiClient.get<ApiResponse<CreditTransaction[]>>(
      `/credits/transactions?${params.toString()}`
    )
    return response.data.data
  }

  /**
   * Purchases credits using a predefined package.
   */
  async purchaseCredits(request: CreditPurchaseRequest): Promise<CreditPurchaseResponse> {
    const response = await apiClient.post<ApiResponse<CreditPurchaseResponse>>(
      '/credits/purchase',
      request
    )
    
    // Update auth store with new balance
    const newBalance = response.data.data.newBalance
    useAuthStore.getState().updateCredits(newBalance)
    
    return response.data.data
  }

  /**
   * Deducts credits for service usage.
   */
  async deductCredits(request: CreditDeductionRequest): Promise<CreditDeductionResponse> {
    const response = await apiClient.post<ApiResponse<CreditDeductionResponse>>(
      '/credits/deduct',
      request
    )
    
    // Update auth store with new balance
    const newBalance = response.data.data.newBalance
    useAuthStore.getState().updateCredits(newBalance)
    
    return response.data.data
  }

  /**
   * Checks if the user has sufficient credits.
   */
  async checkSufficientCredits(amount: number): Promise<boolean> {
    try {
      const balance = await this.getBalance()
      return balance.available >= amount
    } catch {
      // Fallback to auth store
      const user = useAuthStore.getState().user
      return (user?.credits || 0) >= amount
    }
  }

  /**
   * Calculates the credit cost for a service.
   */
  calculateServiceCost(params: CreditCostCalculationParams): number {
    const { service } = params
    
    switch (service) {
      case 'vessel_tracking': {
        const { criteria = [], days = 1 } = params
        return criteria.length * CREDIT_COSTS.VESSEL_TRACKING.PER_CRITERIA_PER_DAY * days
      }

      case 'area_monitoring': {
        const { areaSize = 1000, days = 1 } = params
        const sizeMultiplier = areaSize <= 1000 ? 1 : areaSize <= 5000 ? 1.5 : 2
        return Math.ceil(CREDIT_COSTS.AREA_MONITORING.BASE_PER_DAY * sizeMultiplier * days)
      }

      case 'fleet_tracking': {
        const { vesselCount = 0, months = 1 } = params
        return CREDIT_COSTS.FLEET_TRACKING.PER_VESSEL_PER_MONTH * vesselCount * months
      }

      case 'compliance_report':
        return CREDIT_COSTS.REPORTS.COMPLIANCE

      case 'chronology_report':
        return CREDIT_COSTS.REPORTS.CHRONOLOGY

      case 'investigation':
        return params.isComplex
          ? CREDIT_COSTS.INVESTIGATION.COMPLEX
          : CREDIT_COSTS.INVESTIGATION.STANDARD

      case 'alert_subscription':
        // TODO: Add alert subscription pricing when implemented
        return 50

      default:
        throw new Error(`Unknown service type: ${service}`)
    }
  }

  /**
   * Reserves credits for a pending transaction.
   */
  async reserveCredits(amount: number, serviceId: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<{ reservationId: string }>>(
      '/credits/reserve',
      { amount, serviceId }
    )
    return response.data.data.reservationId
  }

  /**
   * Confirms a credit reservation.
   */
  async confirmReservation(reservationId: string): Promise<CreditDeductionResponse> {
    const response = await apiClient.post<ApiResponse<CreditDeductionResponse>>(
      '/credits/confirm',
      { reservationId }
    )
    
    // Update auth store with new balance
    const newBalance = response.data.data.newBalance
    useAuthStore.getState().updateCredits(newBalance)
    
    return response.data.data
  }

  /**
   * Cancels a credit reservation.
   */
  async cancelReservation(reservationId: string): Promise<void> {
    await apiClient.post('/credits/cancel', { reservationId })
  }

  /**
   * Gets available credit packages.
   */
  getAvailablePackages() {
    return CREDIT_PACKAGES
  }

  /**
   * Estimates savings for a credit package.
   */
  calculatePackageSavings(packageId: string): number {
    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId)
    if (!pkg) return 0
    
    const totalCredits = pkg.credits + pkg.bonus
    const pricePerCredit = pkg.price / totalCredits
    const standardPrice = 0.99 // Base price per credit
    
    return Math.round((1 - pricePerCredit / standardPrice) * 100)
  }
}

export const creditService = new UnifiedCreditService()