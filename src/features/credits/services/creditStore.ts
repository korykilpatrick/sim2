/**
 * Credit Store - Single Source of Truth for Credit Balance
 *
 * This store manages all credit-related state and ensures consistency
 * across the application. It replaces the credit balance previously
 * stored in authStore and provides centralized credit management.
 *
 * Features:
 * - Single source of truth for credit balance
 * - WebSocket real-time updates
 * - Optimistic updates with rollback
 * - Transaction history caching
 * - Expiring credits tracking
 * - Reservation management
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import type { CreditBalance, CreditTransaction } from '../types'

interface CreditReservation {
  id: string
  amount: number
  serviceId: string
  expiresAt: string
  createdAt: string
}

interface CreditStore {
  // Balance state
  balance: number
  lifetimeCredits: number
  expiringCredits: {
    amount: number
    date: string
  } | null

  // Transaction state
  recentTransactions: CreditTransaction[]

  // Reservation state
  reservations: Map<string, CreditReservation>

  // Loading states
  isInitialized: boolean
  isUpdating: boolean

  // Actions
  setBalance: (balance: CreditBalance) => void
  updateBalance: (newBalance: number) => void
  optimisticUpdate: (amount: number) => void
  rollbackOptimistic: (previousBalance: number) => void
  addTransaction: (transaction: CreditTransaction) => void
  setTransactions: (transactions: CreditTransaction[]) => void

  // Reservation management
  addReservation: (reservation: CreditReservation) => void
  removeReservation: (reservationId: string) => void
  clearExpiredReservations: () => void

  // Utility actions
  reset: () => void
  setInitialized: (initialized: boolean) => void
  setUpdating: (updating: boolean) => void
}

/**
 * Credit store with persistence and real-time sync
 *
 * @example
 * ```typescript
 * // Access current balance
 * const balance = useCreditStore(state => state.balance)
 *
 * // Optimistic update
 * const store = useCreditStore.getState()
 * store.optimisticUpdate(-50)
 * try {
 *   await deductCredits(50)
 * } catch {
 *   store.rollbackOptimistic(previousBalance)
 * }
 * ```
 */
export const useCreditStore = create<CreditStore>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        // Initial state
        balance: 0,
        lifetimeCredits: 0,
        expiringCredits: null,
        recentTransactions: [],
        reservations: new Map(),
        isInitialized: false,
        isUpdating: false,

        // Balance management
        setBalance: (balanceData) =>
          set({
            balance: balanceData.available,
            lifetimeCredits: balanceData.lifetime,
            expiringCredits: balanceData.expiring,
            isInitialized: true,
          }),

        updateBalance: (newBalance) =>
          set({
            balance: newBalance,
            isUpdating: false,
          }),

        optimisticUpdate: (amount) =>
          set((state) => ({
            balance: Math.max(0, state.balance + amount),
            isUpdating: true,
          })),

        rollbackOptimistic: (previousBalance) =>
          set({
            balance: previousBalance,
            isUpdating: false,
          }),

        // Transaction management
        addTransaction: (transaction) =>
          set((state) => ({
            recentTransactions: [
              transaction,
              ...state.recentTransactions,
            ].slice(0, 50),
          })),

        setTransactions: (transactions) =>
          set({
            recentTransactions: transactions.slice(0, 50),
          }),

        // Reservation management
        addReservation: (reservation) =>
          set((state) => {
            const newReservations = new Map(state.reservations)
            newReservations.set(reservation.id, reservation)
            return {
              reservations: newReservations,
              balance: state.balance - reservation.amount,
            }
          }),

        removeReservation: (reservationId) =>
          set((state) => {
            const reservation = state.reservations.get(reservationId)
            if (!reservation) return state

            const newReservations = new Map(state.reservations)
            newReservations.delete(reservationId)

            return {
              reservations: newReservations,
              balance: state.balance + reservation.amount,
            }
          }),

        clearExpiredReservations: () =>
          set((state) => {
            const now = new Date().toISOString()
            const newReservations = new Map(state.reservations)
            let freedAmount = 0

            state.reservations.forEach((reservation, id) => {
              if (reservation.expiresAt < now) {
                freedAmount += reservation.amount
                newReservations.delete(id)
              }
            })

            return {
              reservations: newReservations,
              balance: state.balance + freedAmount,
            }
          }),

        // Utility actions
        reset: () =>
          set({
            balance: 0,
            lifetimeCredits: 0,
            expiringCredits: null,
            recentTransactions: [],
            reservations: new Map(),
            isInitialized: false,
            isUpdating: false,
          }),

        setInitialized: (initialized) => set({ isInitialized: initialized }),
        setUpdating: (updating) => set({ isUpdating: updating }),
      }),
      {
        name: 'credit-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Only persist balance data, not UI states
          balance: state.balance,
          lifetimeCredits: state.lifetimeCredits,
          expiringCredits: state.expiringCredits,
          // Don't persist transactions or reservations
        }),
      },
    ),
  ),
)

/**
 * Selector functions for efficient state access
 */
export const creditSelectors = {
  balance: (state: CreditStore) => state.balance,
  lifetimeCredits: (state: CreditStore) => state.lifetimeCredits,
  expiringCredits: (state: CreditStore) => state.expiringCredits,
  recentTransactions: (state: CreditStore) => state.recentTransactions,
  reservations: (state: CreditStore) => state.reservations,
  totalReserved: (state: CreditStore) => {
    let total = 0
    state.reservations.forEach((r) => {
      total += r.amount
    })
    return total
  },
  availableBalance: (state: CreditStore) => {
    let reserved = 0
    state.reservations.forEach((r) => {
      reserved += r.amount
    })
    return state.balance - reserved
  },
  isInitialized: (state: CreditStore) => state.isInitialized,
  isUpdating: (state: CreditStore) => state.isUpdating,
}

/**
 * Initialize WebSocket listeners for real-time credit updates
 */
export function initializeCreditSync() {
  // This will be called from the app initialization
  // to set up WebSocket listeners for credit events
  import('@/services/websocket').then(({ websocketService }) => {
    // Listen for credit balance updates
    websocketService.on('credit_balance_updated', (data) => {
      useCreditStore.getState().updateBalance(data.balance)
    })

    // Note: 'credit_deducted' and 'credit_purchased' events would need to be added
    // to WebSocketEvents type if they don't exist. For now, we'll use the
    // existing credit_balance_updated event which serves the same purpose
  })
}

// Clear expired reservations periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    useCreditStore.getState().clearExpiredReservations()
  }, 60000) // Every minute
}
