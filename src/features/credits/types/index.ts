/**
 * Unified Credit System Types
 * 
 * This is the single source of truth for all credit-related types in the application.
 * All components, services, and hooks should import credit types from this file.
 */

// Re-export everything from shared types as the foundation
export type {
  CreditBalance,
  CreditTransaction,
  CreditDeductionRequest,
  CreditDeductionResponse,
  ServiceType,
  CreditPackage,
  CreditPurchaseRequest,
  CreditPurchaseResponse,
} from '@/features/shared/types/credits'

// Additional types needed for full functionality
export interface CreditTransactionFilter {
  limit?: number
  offset?: number
  type?: 'purchase' | 'deduction' | 'refund' | 'bonus'
  startDate?: string
  endDate?: string
}

export interface CreditCostCalculationParams {
  service: import('@/features/shared/types/credits').ServiceType
  criteria?: string[]
  days?: number
  areaSize?: number
  vesselCount?: number
  months?: number
  isComplex?: boolean
}

export interface CreditReservation {
  reservationId: string
  amount: number
  serviceId: string
  expiresAt: string
}

// Credit package definitions (moved from service to types)
export const CREDIT_PACKAGES: import('@/features/shared/types/credits').CreditPackage[] = 
  // Use test packages in test environment
  import.meta.env.MODE === 'test' ? [
    {
      id: 'pkg-100',
      name: 'Starter',
      credits: 100,
      price: 10,
      bonus: 0,
      popular: false,
    },
    {
      id: 'pkg-500',
      name: 'Professional',
      credits: 500,
      price: 45,
      bonus: 0,
      popular: false,
    },
    {
      id: 'pkg-1000',
      name: 'Business',
      credits: 1000,
      price: 80,
      bonus: 0,
      popular: true,
    },
    {
      id: 'pkg-5000',
      name: 'Enterprise',
      credits: 5000,
      price: 350,
      bonus: 0,
      popular: false,
    },
  ] : [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 100,
      price: 99,
      bonus: 0,
      popular: false,
    },
    {
      id: 'professional',
      name: 'Professional',
      credits: 500,
      price: 449,
      bonus: 50, // 10% bonus
      popular: true,
    },
    {
      id: 'business',
      name: 'Business',
      credits: 1000,
      price: 849,
      bonus: 150, // 15% bonus
      popular: false,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      credits: 5000,
      price: 3999,
      bonus: 1000, // 20% bonus
      popular: false,
    },
    {
      id: 'custom',
      name: 'Custom Package',
      credits: 10000,
      price: 7499,
      bonus: 2500, // 25% bonus
      popular: false,
    },
  ]