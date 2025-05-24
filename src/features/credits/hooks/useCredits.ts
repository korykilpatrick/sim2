import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { creditService } from '../services/creditService'
import { useAuthStore } from '@/features/auth/services/authStore'
import toast from 'react-hot-toast'

const creditKeys = {
  all: ['credits'] as const,
  balance: () => [...creditKeys.all, 'balance'] as const,
  transactions: (params?: Record<string, unknown>) =>
    [...creditKeys.all, 'transactions', params] as const,
}

export function useCredits() {
  const queryClient = useQueryClient()
  const updateUserCredits = useAuthStore((state) => state.updateCredits)

  // Get credit balance
  const { data: balance, isLoading: isLoadingBalance } = useQuery({
    queryKey: creditKeys.balance(),
    queryFn: () => creditService.getBalance(),
    staleTime: 30000, // 30 seconds
  })

  // Get transaction history
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: creditKeys.transactions(),
    queryFn: () => creditService.getTransactionHistory({ limit: 50 }),
  })

  // Purchase credits mutation
  const purchaseMutation = useMutation({
    mutationFn: creditService.purchaseCredits,
    onSuccess: (data) => {
      // Update local state
      updateUserCredits(data.newBalance)

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: creditKeys.all })

      toast.success(`Successfully purchased ${data.creditsAdded} credits!`)
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to purchase credits'
      toast.error(message)
    },
  })

  // Deduct credits mutation
  const deductMutation = useMutation({
    mutationFn: creditService.deductCredits,
    onSuccess: (data) => {
      // Update local state
      updateUserCredits(data.newBalance)

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: creditKeys.all })
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to deduct credits'
      toast.error(message)
    },
  })

  // Check sufficient credits
  const checkCredits = async (amount: number): Promise<boolean> => {
    try {
      return await creditService.checkSufficientCredits(amount)
    } catch {
      return false
    }
  }

  return {
    balance: balance?.current || 0,
    lifetimeCredits: balance?.lifetime || 0,
    expiringCredits: balance?.expiringCredits,
    transactions: transactions || [],
    isLoadingBalance,
    isLoadingTransactions,
    purchaseCredits: purchaseMutation.mutate,
    isPurchasing: purchaseMutation.isPending,
    deductCredits: deductMutation.mutate,
    isDeducting: deductMutation.isPending,
    checkCredits,
    availablePackages: creditService.getAvailablePackages(),
    calculateCost: creditService.calculateServiceCost,
  }
}
