/**
 * Unified Credit Hook
 * 
 * This hook combines functionality from both credit implementations
 * and provides a comprehensive interface for credit management.
 */

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/services/authStore'
import { useToast } from '@/hooks/useToast'
import { creditService } from '../services/unifiedCreditService'
import type {
  CreditTransactionFilter,
  CreditPurchaseRequest,
  CreditDeductionRequest,
  ServiceType,
  CreditCostCalculationParams,
} from '../types'

const creditKeys = {
  all: ['credits'] as const,
  balance: () => [...creditKeys.all, 'balance'] as const,
  transactions: (filter?: CreditTransactionFilter) =>
    [...creditKeys.all, 'transactions', filter] as const,
}

export function useUnifiedCredits() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const user = useAuthStore((state) => state.user)
  const updateUserCredits = useAuthStore((state) => state.updateCredits)
  const [reservations] = useState(new Map<string, { amount: number; expiresAt: string }>())

  // Get credit balance
  const {
    data: balance,
    isLoading: isLoadingBalance,
    isError,
    error,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: creditKeys.balance(),
    queryFn: () => creditService.getBalance(),
    staleTime: 30000, // 30 seconds
    retry: 1,
  })

  // Get transaction history
  const { 
    data: transactions, 
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: creditKeys.transactions(),
    queryFn: () => creditService.getTransactionHistory({ limit: 50 }),
  })

  // Purchase credits mutation
  const purchaseMutation = useMutation({
    mutationFn: (request: CreditPurchaseRequest) => creditService.purchaseCredits(request),
    onSuccess: (data) => {
      // Update local state
      updateUserCredits(data.newBalance)

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: creditKeys.all })

      showToast({
        type: 'success',
        message: `Successfully purchased ${data.creditsAdded} credits!`,
      })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to purchase credits'
      showToast({ type: 'error', message })
    },
  })

  // Deduct credits mutation
  const deductMutation = useMutation({
    mutationFn: (request: CreditDeductionRequest) => creditService.deductCredits(request),
    onSuccess: (data) => {
      // Update local state
      updateUserCredits(data.newBalance)

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: creditKeys.all })
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to deduct credits'
      showToast({ type: 'error', message })
    },
  })

  // Check sufficient credits (async)
  const checkCredits = async (amount: number): Promise<boolean> => {
    try {
      return await creditService.checkSufficientCredits(amount)
    } catch {
      return false
    }
  }

  // Check sufficient credits (sync, using current balance)
  const checkSufficientCredits = (amount: number): boolean => {
    return (balance?.available || user?.credits || 0) >= amount
  }

  // Deduct credits helper with better error handling
  const deductCredits = async (
    amount: number,
    description: string,
    serviceType: ServiceType,
    serviceId?: string,
  ) => {
    // Check balance first
    if (!checkSufficientCredits(amount)) {
      throw new Error('Insufficient credits')
    }

    return deductMutation.mutateAsync({
      amount,
      description,
      serviceId: serviceId || `service-${Date.now()}`,
      serviceType,
    })
  }

  // Reserve credits for future deduction
  const reserveCredits = async (amount: number, serviceId: string) => {
    if (!checkSufficientCredits(amount)) {
      throw new Error('Insufficient credits')
    }

    const reservationId = await creditService.reserveCredits(amount, serviceId)
    reservations.set(reservationId, {
      amount,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    })
    
    return reservationId
  }

  // Confirm a credit reservation
  const confirmReservation = async (reservationId: string) => {
    const result = await creditService.confirmReservation(reservationId)
    
    // Update local state
    updateUserCredits(result.newBalance)
    
    // Clean up reservation
    reservations.delete(reservationId)
    
    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: creditKeys.all })
    
    return result
  }

  // Cancel a credit reservation
  const cancelReservation = async (reservationId: string) => {
    await creditService.cancelReservation(reservationId)
    reservations.delete(reservationId)
  }

  // Calculate service cost
  const calculateCost = (params: CreditCostCalculationParams): number => {
    return creditService.calculateServiceCost(params)
  }

  // Get filtered transactions
  const getFilteredTransactions = async (filter: CreditTransactionFilter) => {
    return creditService.getTransactionHistory(filter)
  }

  return {
    // Balance information
    balance: balance?.available || user?.credits || 0,
    lifetimeCredits: balance?.lifetime || 0,
    expiringCredits: balance?.expiring ? {
      amount: balance.expiring.amount,
      date: balance.expiring.date,
    } : null,
    
    // Transactions
    transactions: transactions || [],
    
    // Loading states
    isLoading: isLoadingBalance,
    isLoadingBalance,
    isLoadingTransactions,
    
    // Error states
    isError,
    error,
    
    // Refresh functions
    refetch: refetchBalance,
    refetchBalance,
    refetchTransactions,
    
    // Purchase operations
    purchaseCredits: purchaseMutation.mutate,
    purchaseCreditsAsync: purchaseMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    
    // Deduction operations
    deductCredits,
    deductCreditsRaw: deductMutation.mutate,
    isDeducting: deductMutation.isPending,
    
    // Credit checks
    checkCredits,
    checkSufficientCredits,
    
    // Reservation system
    reserveCredits,
    confirmReservation,
    cancelReservation,
    
    // Utilities
    availablePackages: creditService.getAvailablePackages(),
    calculateCost,
    calculatePackageSavings: creditService.calculatePackageSavings,
    getFilteredTransactions,
    
    // Direct service access for advanced use cases
    creditService,
  }
}