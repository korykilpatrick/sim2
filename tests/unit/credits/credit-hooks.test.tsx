import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { TestProviders, setupAuthenticatedUser, clearAuth } from '../../utils/test-utils'
import { server, resetMockData } from '../../utils/api-mocks'
import { http, HttpResponse } from 'msw'
import { useCredits } from '@/features/credits/hooks/useCredits'
import { useCreditDeduction } from '@/features/shared/hooks/useCreditDeduction'
import { useCreditPricing } from '@/features/shared/hooks/useCreditPricing'
import { useCostCalculation } from '@/features/shared/hooks/useCostCalculation'
import { useAuthStore } from '@/features/auth/services/authStore'

beforeEach(() => {
  setupAuthenticatedUser()
  resetMockData()
})

afterEach(() => {
  clearAuth()
  vi.clearAllMocks()
})

describe('useCredits Hook', () => {
  it('should fetch and return credit balance', async () => {
    const { result } = renderHook(() => useCredits(), {
      wrapper: TestProviders
    })
    
    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.balance).toBe(0)
    
    // Wait for data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.balance).toBe(1000)
    expect(result.current.lifetimeCredits).toBe(5000)
    expect(result.current.expiringCredits).toHaveLength(2)
  })

  it('should sync balance with auth store', async () => {
    const { result } = renderHook(() => useCredits(), {
      wrapper: TestProviders
    })
    
    await waitFor(() => {
      expect(result.current.balance).toBe(1000)
    })
    
    // Check auth store is updated
    const authState = useAuthStore.getState()
    expect(authState.user?.credits).toBe(1000)
  })

  it('should refetch balance on manual trigger', async () => {
    let callCount = 0
    server.use(
      http.get('*/credits/balance', () => {
        callCount++
        return HttpResponse.json({
          current: 1000 + callCount * 100,
          lifetime: 5000,
          expiringCredits: []
        })
      })
    )
    
    const { result } = renderHook(() => useCredits(), {
      wrapper: TestProviders
    })
    
    await waitFor(() => {
      expect(result.current.balance).toBe(1100) // First call
    })
    
    // Trigger refetch
    await act(async () => {
      await result.current.refetch()
    })
    
    await waitFor(() => {
      expect(result.current.balance).toBe(1200) // Second call
    })
  })

  it('should handle error states', async () => {
    server.use(
      http.get('*/credits/balance', () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )
    
    const { result } = renderHook(() => useCredits(), {
      wrapper: TestProviders
    })
    
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    
    expect(result.current.error).toBeDefined()
    expect(result.current.balance).toBe(0)
  })

  it('should check sufficient credits correctly', async () => {
    const { result } = renderHook(() => useCredits(), {
      wrapper: TestProviders
    })
    
    await waitFor(() => {
      expect(result.current.balance).toBe(1000)
    })
    
    expect(result.current.checkSufficientCredits(500)).toBe(true)
    expect(result.current.checkSufficientCredits(1000)).toBe(true)
    expect(result.current.checkSufficientCredits(1001)).toBe(false)
  })
})

describe('useCreditDeduction Hook', () => {
  it('should deduct credits successfully', async () => {
    const { result } = renderHook(() => useCreditDeduction(), {
      wrapper: TestProviders
    })
    
    const deductionResult = await result.current.deductCredits(100, 'Test service')
    
    expect(deductionResult).toMatchObject({
      success: true,
      newBalance: 900,
      transaction: expect.objectContaining({
        type: 'deduction',
        amount: -100,
        description: 'Test service'
      })
    })
  })

  it('should handle insufficient credits error', async () => {
    const { result } = renderHook(() => useCreditDeduction(), {
      wrapper: TestProviders
    })
    
    await expect(
      result.current.deductCredits(2000, 'Expensive service')
    ).rejects.toThrow('Insufficient credits')
  })

  it('should show loading state during deduction', async () => {
    const { result } = renderHook(() => useCreditDeduction(), {
      wrapper: TestProviders
    })
    
    expect(result.current.isDeducting).toBe(false)
    
    const deductionPromise = result.current.deductCredits(100, 'Test')
    
    expect(result.current.isDeducting).toBe(true)
    
    await deductionPromise
    
    expect(result.current.isDeducting).toBe(false)
  })

  it('should reserve and confirm credits', async () => {
    const { result } = renderHook(() => useCreditDeduction(), {
      wrapper: TestProviders
    })
    
    // Reserve credits
    const reservation = await result.current.reserveCredits(200, 'vessel-tracking')
    
    expect(reservation).toMatchObject({
      reservationId: expect.stringMatching(/^res-/),
      amount: 200,
      expiresAt: expect.any(String)
    })
    
    // Confirm reservation
    const confirmation = await result.current.confirmReservation(reservation.reservationId)
    
    expect(confirmation).toMatchObject({
      success: true,
      newBalance: 800,
      transaction: expect.objectContaining({
        type: 'deduction',
        amount: -50 // Mocked amount
      })
    })
  })

  it('should cancel reservation', async () => {
    const { result } = renderHook(() => useCreditDeduction(), {
      wrapper: TestProviders
    })
    
    const reservation = await result.current.reserveCredits(300, 'area-monitoring')
    
    const cancellation = await result.current.cancelReservation(reservation.reservationId)
    
    expect(cancellation).toMatchObject({
      success: true,
      message: 'Reservation cancelled'
    })
  })
})

describe('useCreditPricing Hook', () => {
  it('should calculate vessel tracking price', () => {
    const { result } = renderHook(() => useCreditPricing(), {
      wrapper: TestProviders
    })
    
    const cost = result.current.calculateVesselTrackingCost(3, 10)
    expect(cost).toBe(150) // 3 criteria × 5 credits × 10 days
  })

  it('should calculate area monitoring price', () => {
    const { result } = renderHook(() => useCreditPricing(), {
      wrapper: TestProviders
    })
    
    const cost = result.current.calculateAreaMonitoringCost(200, 30)
    expect(cost).toBe(900) // (10 + 200×0.1) × 30
  })

  it('should calculate fleet tracking price with discounts', () => {
    const { result } = renderHook(() => useCreditPricing(), {
      wrapper: TestProviders
    })
    
    const costSmall = result.current.calculateFleetTrackingCost(10, 1)
    expect(costSmall).toBe(1000) // No discount
    
    const costMedium = result.current.calculateFleetTrackingCost(30, 1)
    expect(costMedium).toBe(2700) // 10% discount
    
    const costLarge = result.current.calculateFleetTrackingCost(60, 1)
    expect(costLarge).toBe(4800) // 20% discount
  })

  it('should get report costs', () => {
    const { result } = renderHook(() => useCreditPricing(), {
      wrapper: TestProviders
    })
    
    expect(result.current.getReportCost('compliance')).toBe(50)
    expect(result.current.getReportCost('chronology')).toBe(75)
  })

  it('should get investigation costs', () => {
    const { result } = renderHook(() => useCreditPricing(), {
      wrapper: TestProviders
    })
    
    expect(result.current.getInvestigationCost('basic')).toBe(5000)
    expect(result.current.getInvestigationCost('comprehensive')).toBe(10000)
  })

  it('should format credit amounts', () => {
    const { result } = renderHook(() => useCreditPricing(), {
      wrapper: TestProviders
    })
    
    expect(result.current.formatCredits(1000)).toBe('1,000 credits')
    expect(result.current.formatCredits(1)).toBe('1 credit')
  })
})

describe('useCostCalculation Hook', () => {
  it('should calculate costs with sufficient balance', async () => {
    const { result } = renderHook(() => useCostCalculation(), {
      wrapper: TestProviders
    })
    
    await waitFor(() => {
      expect(result.current.balance).toBe(1000)
    })
    
    const calculation = result.current.calculateCost('vessel-tracking', {
      criteriaCount: 2,
      durationDays: 10
    })
    
    expect(calculation).toMatchObject({
      cost: 100,
      hasSufficientCredits: true,
      shortfall: 0
    })
  })

  it('should calculate costs with insufficient balance', async () => {
    const { result } = renderHook(() => useCostCalculation(), {
      wrapper: TestProviders
    })
    
    await waitFor(() => {
      expect(result.current.balance).toBe(1000)
    })
    
    const calculation = result.current.calculateCost('area-monitoring', {
      areaSizeKm2: 1000,
      durationDays: 30
    })
    
    // Cost: (10 + 1000×0.3) × 30 = 9300
    expect(calculation).toMatchObject({
      cost: 9300,
      hasSufficientCredits: false,
      shortfall: 8300
    })
  })

  it('should validate credit sufficiency', async () => {
    const { result } = renderHook(() => useCostCalculation(), {
      wrapper: TestProviders
    })
    
    await waitFor(() => {
      expect(result.current.balance).toBe(1000)
    })
    
    expect(result.current.canAfford(500)).toBe(true)
    expect(result.current.canAfford(1000)).toBe(true)
    expect(result.current.canAfford(1001)).toBe(false)
  })

  it('should calculate cost breakdowns', async () => {
    const { result } = renderHook(() => useCostCalculation(), {
      wrapper: TestProviders
    })
    
    const breakdown = result.current.getCostBreakdown('vessel-tracking', {
      criteriaCount: 3,
      durationDays: 7
    })
    
    expect(breakdown).toMatchObject({
      baseRate: 5,
      multiplier: 3,
      duration: 7,
      total: 105,
      dailyCost: 15
    })
  })
})