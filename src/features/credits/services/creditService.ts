import { apiClient } from '@/api/client'
import type { CreditTransaction } from '../components/CreditTransactionHistory'

export interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  savings: number
  popular?: boolean
}

export interface CreditBalance {
  current: number
  lifetime: number
  expiringCredits?: Array<{
    amount: number
    expiresAt: string
  }>
}

export interface PurchaseCreditRequest {
  packageId: string
  paymentMethod?: string
}

export interface PurchaseCreditResponse {
  transactionId: string
  creditsAdded: number
  newBalance: number
  invoice?: {
    id: string
    url: string
  }
}

export interface DeductCreditsRequest {
  amount: number
  service: string
  referenceId: string
  description: string
}

export interface DeductCreditsResponse {
  success: boolean
  newBalance: number
  transactionId: string
}

class CreditService {
  /**
   * Get user's current credit balance
   */
  async getBalance(): Promise<CreditBalance> {
    const response = await apiClient.get<{ success: boolean; data: CreditBalance }>('/credits/balance')
    return response.data.data
  }

  /**
   * Get credit transaction history
   */
  async getTransactionHistory(params?: {
    limit?: number
    offset?: number
    type?: 'purchase' | 'usage' | 'refund'
  }): Promise<CreditTransaction[]> {
    const response = await apiClient.get<{ success: boolean; data: CreditTransaction[] }>(
      '/credits/transactions',
      { params },
    )
    return response.data.data
  }

  /**
   * Purchase credits (mock implementation)
   */
  async purchaseCredits(
    request: PurchaseCreditRequest,
  ): Promise<PurchaseCreditResponse> {
    const response = await apiClient.post<{ success: boolean; data: PurchaseCreditResponse }>(
      '/credits/purchase',
      request,
    )
    return response.data.data
  }

  /**
   * Deduct credits for service usage
   */
  async deductCredits(
    request: DeductCreditsRequest,
  ): Promise<DeductCreditsResponse> {
    const response = await apiClient.post<{ success: boolean; data: DeductCreditsResponse }>(
      '/credits/deduct',
      request,
    )
    return response.data.data
  }

  /**
   * Check if user has sufficient credits
   */
  async checkSufficientCredits(amount: number): Promise<boolean> {
    const balance = await this.getBalance()
    return balance.current >= amount
  }

  /**
   * Get available credit packages
   */
  getAvailablePackages(): CreditPackage[] {
    return [
      {
        id: 'starter',
        name: 'Starter Pack',
        credits: 100,
        price: 99,
        savings: 0,
        popular: false,
      },
      {
        id: 'professional',
        name: 'Professional',
        credits: 500,
        price: 449,
        savings: 10,
        popular: true,
      },
      {
        id: 'business',
        name: 'Business',
        credits: 1000,
        price: 849,
        savings: 15,
        popular: false,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        credits: 5000,
        price: 3999,
        savings: 20,
        popular: false,
      },
      {
        id: 'custom',
        name: 'Custom Package',
        credits: 10000,
        price: 7499,
        savings: 25,
        popular: false,
      },
    ]
  }

  /**
   * Calculate credit cost for a service
   */
  calculateServiceCost(
    service: string,
    params: Record<string, unknown>,
  ): number {
    switch (service) {
      case 'vessel-tracking': {
        const days = (params.duration as number) || 30
        const criteriaCount = (params.criteria as unknown[])?.length || 1
        return Math.ceil(5 * criteriaCount * days)
      }

      case 'area-monitoring': {
        const areaSize = (params.areaSize as number) || 1000 // km²
        const monitoringDays = (params.duration as number) || 30
        return Math.ceil((10 + areaSize * 0.01) * monitoringDays)
      }

      case 'fleet-tracking': {
        const vesselCount = (params.vesselCount as number) || 1
        return 100 * vesselCount
      }

      case 'compliance-report':
        return 50

      case 'chronology-report':
        return 75

      case 'investigation':
        return params.type === 'basic' ? 5000 : 10000

      default:
        return 0
    }
  }
}

export const creditService = new CreditService()
