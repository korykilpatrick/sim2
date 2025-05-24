/**
 * Types for credit management and transactions
 */

export interface CreditBalance {
  available: number
  lifetime: number
  expiring: {
    amount: number
    date: string
  } | null
}

export interface CreditTransaction {
  id: string
  type: 'purchase' | 'deduction' | 'refund' | 'bonus'
  amount: number
  balance: number
  description: string
  serviceId?: string
  serviceType?: ServiceType
  createdAt: string
}

export interface CreditDeductionRequest {
  amount: number
  description: string
  serviceId: string
  serviceType: ServiceType
  metadata?: Record<string, unknown>
}

export interface CreditDeductionResponse {
  transactionId: string
  previousBalance: number
  newBalance: number
  deductedAmount: number
  timestamp: string
}

export type ServiceType =
  | 'vessel_tracking'
  | 'area_monitoring'
  | 'fleet_tracking'
  | 'compliance_report'
  | 'chronology_report'
  | 'investigation'
  | 'alert_subscription'

export interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  bonus: number
  popular?: boolean
}

export interface CreditPurchaseRequest {
  packageId: string
  paymentMethodId: string
}

export interface CreditPurchaseResponse {
  transactionId: string
  creditsAdded: number
  newBalance: number
  invoiceUrl?: string
}
