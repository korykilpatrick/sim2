import { creditService as sharedCreditService } from '@/features/shared/services/creditService'
import { creditAdapter } from './creditAdapter'
import type { CreditBalance, CreditTransaction } from './creditAdapter'
import type { ServiceType } from '@/features/shared/types/credits'

// Re-export types for backwards compatibility
export type { CreditBalance, CreditTransaction } from './creditAdapter'

export interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  savings: number
  popular?: boolean
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
   * @deprecated Use shared credit service directly for new code
   */
  async getBalance(): Promise<CreditBalance> {
    const sharedBalance = await sharedCreditService.getBalance()
    return creditAdapter.toFeaturesFormat(sharedBalance)
  }

  /**
   * Get credit transaction history
   * @deprecated Use shared credit service directly for new code
   */
  async getTransactionHistory(params?: {
    limit?: number
    offset?: number
    type?: 'purchase' | 'usage' | 'refund'
  }): Promise<CreditTransaction[]> {
    // TODO: Filter transactions by type once shared service supports it
    const sharedTransactions = await sharedCreditService.getTransactions()
    
    // Filter client-side for now
    let filtered = sharedTransactions
    if (params?.type) {
      const mappedType = params.type === 'usage' ? 'deduction' : params.type
      filtered = sharedTransactions.filter(t => t.type === mappedType)
    }
    
    // Apply limit
    if (params?.limit) {
      filtered = filtered.slice(0, params.limit)
    }
    
    return creditAdapter.transactionsToFeaturesFormat(filtered)
  }

  /**
   * Purchase credits
   * @deprecated Use shared credit service directly for new code
   */
  async purchaseCredits(
    request: PurchaseCreditRequest,
  ): Promise<PurchaseCreditResponse> {
    // For now, call the shared service purchase method
    // This would need to be implemented in the shared service
    const balance = await sharedCreditService.getBalance()
    
    // Mock response for backwards compatibility
    return {
      transactionId: `txn_${Date.now()}`,
      creditsAdded: this.getAvailablePackages().find(p => p.id === request.packageId)?.credits || 0,
      newBalance: balance.available + (this.getAvailablePackages().find(p => p.id === request.packageId)?.credits || 0),
      invoice: {
        id: `inv_${Date.now()}`,
        url: `/invoices/inv_${Date.now()}`
      }
    }
  }

  /**
   * Deduct credits for service usage
   * @deprecated Use shared credit service deductCredits directly for new code
   */
  async deductCredits(
    request: DeductCreditsRequest,
  ): Promise<DeductCreditsResponse> {
    try {
      // Map to shared service format
      const serviceType = this.mapServiceToType(request.service)
      const result = await sharedCreditService.deductCredits({
        amount: request.amount,
        serviceType,
        description: request.description,
        serviceId: request.referenceId,
        metadata: { service: request.service }
      })
      
      return {
        success: true,
        newBalance: (await sharedCreditService.getBalance()).available,
        transactionId: result.transactionId
      }
    } catch (error) {
      return {
        success: false,
        newBalance: 0,
        transactionId: ''
      }
    }
  }

  /**
   * Check if user has sufficient credits
   * @deprecated Use shared credit service directly for new code
   */
  async checkSufficientCredits(amount: number): Promise<boolean> {
    const balance = await sharedCreditService.getBalance()
    return balance.available >= amount
  }

  /**
   * Map service string to ServiceType enum
   */
  private mapServiceToType(service: string): ServiceType {
    const mapping: Record<string, ServiceType> = {
      'vessel-tracking': 'vessel_tracking',
      'area-monitoring': 'area_monitoring',
      'fleet-tracking': 'fleet_tracking',
      'compliance-report': 'compliance_report',
      'chronology-report': 'chronology_report',
      'investigation': 'investigation'
    }
    return mapping[service] || 'vessel_tracking'
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
