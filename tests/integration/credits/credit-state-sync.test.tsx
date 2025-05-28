import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor, renderHook, act } from '@testing-library/react'
import {
  renderWithProviders,
  setupAuthenticatedUser,
  clearAuth,
} from '../../utils/test-helpers'
import { TestProviders } from '../../utils/test-utils'
import { server } from '../../utils/api-mocks'
import {
  featuresCreditHandlers,
  resetFeaturesCreditData,
} from '../../utils/credit-mocks'
import Header from '@/components/layout/core/Header'
import { useAuthStore } from '@/features/auth/services/authStore'
import { useCreditStore, initializeCreditSync } from '@/features/credits/services/creditStore'
import { useCredits } from '@/features/credits'
import { websocketService } from '@/services/websocket'

beforeEach(() => {
  setupAuthenticatedUser()
  resetFeaturesCreditData()
  server.use(...featuresCreditHandlers)
  vi.clearAllMocks()
  
  // Initialize credit store with test data
  const creditStore = useCreditStore.getState()
  creditStore.setBalance({
    available: 1000,
    lifetime: 5000,
    expiring: null
  })
})

afterEach(() => {
  clearAuth()
  vi.clearAllMocks()
  server.resetHandlers()
  useCreditStore.getState().reset()
})

describe('Credit State Synchronization', () => {
  describe('Single Source of Truth', () => {
    it('should NOT have credits field in User type', async () => {
      const authStore = useAuthStore.getState()
      const user = authStore.user
      
      // This test should FAIL initially because User type still has credits field
      expect(user).not.toHaveProperty('credits')
    })

    it('should use creditStore as the single source of truth', async () => {
      const { result: authResult } = renderHook(() => useAuthStore(), {
        wrapper: TestProviders,
      })
      
      const { result: creditResult } = renderHook(() => useCreditStore(), {
        wrapper: TestProviders,
      })

      // Credit balance should only exist in creditStore
      expect(creditResult.current.balance).toBe(1000)
      
      // This should fail - authStore.user should NOT have credits
      expect(authResult.current.user).not.toHaveProperty('credits')
    })
  })

  describe('Component Migration', () => {
    it('Header should use creditStore instead of authStore.user.credits', async () => {
      const { result: creditResult } = renderHook(() => useCreditStore(), {
        wrapper: TestProviders,
      })

      // Set credit store balance
      act(() => {
        creditResult.current.setBalance(2500)
      })

      renderWithProviders(<Header />)

      // This should fail initially because Header still uses authStore.user.credits
      await waitFor(() => {
        const creditDisplay = screen.getByText(/2,500 Credits/i)
        expect(creditDisplay).toBeInTheDocument()
      })
    })

    it('should not update authStore when credits change', async () => {
      const { result: authResult } = renderHook(() => useAuthStore(), {
        wrapper: TestProviders,
      })
      
      const { result: creditResult } = renderHook(() => useCreditStore(), {
        wrapper: TestProviders,
      })

      const initialUser = authResult.current.user

      // Update credit balance
      act(() => {
        creditResult.current.setBalance(3000)
      })

      // User object should remain unchanged (no credits field)
      expect(authResult.current.user).toEqual(initialUser)
      expect(authResult.current.user).not.toHaveProperty('credits')
    })
  })

  describe('WebSocket Synchronization', () => {
    it('should update creditStore on WebSocket credit_balance_updated event', async () => {
      const { result: creditResult } = renderHook(() => useCreditStore(), {
        wrapper: TestProviders,
      })

      // Initialize WebSocket credit sync
      act(() => {
        initializeCreditSync()
      })

      // Simulate WebSocket credit update
      act(() => {
        websocketService.emit('credit_balance_updated', { balance: 1500 })
      })

      await waitFor(() => {
        expect(creditResult.current.balance).toBe(1500)
      })
    })

    it('should NOT update authStore on WebSocket credit events', async () => {
      const { result: authResult } = renderHook(() => useAuthStore(), {
        wrapper: TestProviders,
      })
      
      const { result: creditResult } = renderHook(() => useCreditStore(), {
        wrapper: TestProviders,
      })

      // Initialize WebSocket credit sync
      act(() => {
        initializeCreditSync()
      })

      const initialUser = authResult.current.user

      // Simulate WebSocket credit update
      act(() => {
        websocketService.emit('credit_balance_updated', { balance: 2000 })
      })

      await waitFor(() => {
        expect(creditResult.current.balance).toBe(2000)
      })

      // Auth store user should remain unchanged
      expect(authResult.current.user).toEqual(initialUser)
      expect(authResult.current.user).not.toHaveProperty('credits')
    })
  })

  describe('React Query Cache', () => {
    it('should update React Query cache when creditStore changes', async () => {
      const { result: creditHook } = renderHook(() => useCredits(), {
        wrapper: TestProviders,
      })

      const { result: creditStore } = renderHook(() => useCreditStore(), {
        wrapper: TestProviders,
      })

      // Wait for initial load
      await waitFor(() => {
        expect(creditHook.current.balance).toBe(1000)
      })

      // Update credit store
      act(() => {
        creditStore.current.setBalance(1800)
      })

      // React Query should reflect the change
      await waitFor(() => {
        expect(creditHook.current.balance).toBe(1800)
      })
    })

    it('should not have race conditions between API and WebSocket updates', async () => {
      const { result: creditHook } = renderHook(() => useCredits(), {
        wrapper: TestProviders,
      })

      // Wait for initial load
      await waitFor(() => {
        expect(creditHook.current.balance).toBe(1000)
      })

      // Simulate simultaneous updates
      const apiPromise = creditHook.current.deductCredits(100, 'API deduction')
      
      // Simulate WebSocket update at the same time
      act(() => {
        websocketService.emit('credit_balance_updated', { balance: 850 })
      })

      await apiPromise

      // Final balance should be consistent
      await waitFor(() => {
        // Should be 850 (WebSocket) or 900 (API), but not both
        const balance = creditHook.current.balance
        expect([850, 900]).toContain(balance)
      })
    })
  })

  describe('Migration Completeness', () => {
    it('should have no remaining references to authStore.user.credits', async () => {
      // This is a meta-test to ensure migration is complete
      // It will fail until all components are migrated
      
      // Mock console.warn to detect legacy usage
      const warnSpy = vi.spyOn(console, 'warn')
      
      // Render common components that might use credits
      renderWithProviders(<Header />)
      
      // Check for deprecation warnings
      expect(warnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('authStore.user.credits is deprecated')
      )
    })
  })
})