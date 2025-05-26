import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor, renderHook } from '@testing-library/react'
import { renderWithProviders, setupAuthenticatedUser, clearAuth, userEvent } from '../../utils/test-utils'
import { server, resetMockData } from '../../utils/api-mocks'
import { http, HttpResponse } from 'msw'
import { VesselTrackingPage } from '@/features/vessels/pages/VesselTrackingPage'
import { AreaMonitoringPage } from '@/features/areas/pages/AreaMonitoringPage'
import { useCredits } from '@/features/credits'
import { useCreditDeduction } from '@/features/shared/hooks/useCreditDeduction'

beforeEach(() => {
  setupAuthenticatedUser()
  resetMockData()
})

afterEach(() => {
  clearAuth()
  vi.clearAllMocks()
})

describe('Credit Deduction Integration Tests', () => {
  describe('Vessel Tracking Credit Deduction', () => {
    it('should deduct credits when starting vessel tracking', async () => {
      const user = userEvent.setup()
      renderWithProviders(<VesselTrackingPage />)
      
      // Open tracking wizard
      const startTrackingBtn = await screen.findByText(/Start New Tracking/i)
      await user.click(startTrackingBtn)
      
      // Select vessel
      const vesselInput = screen.getByPlaceholderText(/Search vessels/i)
      await user.type(vesselInput, 'Test Vessel')
      
      const vesselOption = await screen.findByText('Test Vessel')
      await user.click(vesselOption)
      
      // Configure tracking (5 credits per day per criteria)
      const criteriaCheckboxes = screen.getAllByRole('checkbox')
      await user.click(criteriaCheckboxes[0]) // Speed criteria
      await user.click(criteriaCheckboxes[1]) // Course criteria
      
      // Set duration (10 days)
      const durationInput = screen.getByLabelText(/Duration/i)
      await user.clear(durationInput)
      await user.type(durationInput, '10')
      
      // Cost should be: 2 criteria × 5 credits × 10 days = 100 credits
      expect(screen.getByText(/Total Cost: 100 credits/i)).toBeInTheDocument()
      
      // Start tracking
      const confirmBtn = screen.getByText(/Start Tracking/i)
      await user.click(confirmBtn)
      
      // Verify deduction API call
      await waitFor(() => {
        expect(screen.getByText(/Tracking started successfully/i)).toBeInTheDocument()
      })
      
      // Check balance was updated
      const newBalance = await screen.findByTestId('credit-balance')
      expect(newBalance).toHaveTextContent('900')
    })

    it('should prevent tracking when insufficient credits', async () => {
      // Set low balance
      server.use(
        http.get('*/credits/balance', () => {
          return HttpResponse.json({
            current: 50,
            lifetime: 5000,
            expiringCredits: []
          })
        })
      )
      
      const user = userEvent.setup()
      renderWithProviders(<VesselTrackingPage />)
      
      // Try to start tracking that costs 100 credits
      const startTrackingBtn = await screen.findByText(/Start New Tracking/i)
      await user.click(startTrackingBtn)
      
      // Configure tracking that would cost 100 credits
      // ... (vessel selection and criteria setup)
      
      const confirmBtn = screen.getByText(/Start Tracking/i)
      expect(confirmBtn).toBeDisabled()
      expect(screen.getByText(/Insufficient credits/i)).toBeInTheDocument()
    })
  })

  describe('Area Monitoring Credit Deduction', () => {
    it('should calculate and deduct credits based on area size', async () => {
      const user = userEvent.setup()
      renderWithProviders(<AreaMonitoringPage />)
      
      // Create new area
      const createAreaBtn = await screen.findByText(/Create New Area/i)
      await user.click(createAreaBtn)
      
      // Define area (mocked to be 150 sq km)
      // Area cost: Base 10 credits + (150 * 0.1) = 25 credits per day
      
      // Set monitoring duration (30 days)
      const durationSelect = screen.getByLabelText(/Monitoring Duration/i)
      await user.selectOptions(durationSelect, '30')
      
      // Total cost: 25 × 30 = 750 credits
      expect(screen.getByText(/Total Cost: 750 credits/i)).toBeInTheDocument()
      
      // Create area
      const confirmBtn = screen.getByText(/Create Area/i)
      await user.click(confirmBtn)
      
      await waitFor(() => {
        expect(screen.getByText(/Area created successfully/i)).toBeInTheDocument()
      })
      
      // Verify balance updated
      const newBalance = await screen.findByTestId('credit-balance')
      expect(newBalance).toHaveTextContent('250') // 1000 - 750
    })
  })

  describe('Credit Reservation Flow', () => {
    it('should reserve credits before confirming transaction', async () => {
      const { result } = renderHook(() => useCreditDeduction(), {
        wrapper: TestProviders
      })
      
      // Reserve credits
      const reservation = await result.current.reserveCredits(100, 'vessel-tracking')
      
      expect(reservation).toMatchObject({
        reservationId: expect.stringMatching(/^res-/),
        amount: 100,
        expiresAt: expect.any(String)
      })
      
      // Confirm reservation
      const confirmResult = await result.current.confirmReservation(reservation.reservationId)
      
      expect(confirmResult.success).toBe(true)
      expect(confirmResult.newBalance).toBe(900)
    })

    it('should cancel reservation on failure', async () => {
      const { result } = renderHook(() => useCreditDeduction(), {
        wrapper: TestProviders
      })
      
      // Reserve credits
      const reservation = await result.current.reserveCredits(100, 'vessel-tracking')
      
      // Simulate service creation failure
      // Cancel reservation
      const cancelResult = await result.current.cancelReservation(reservation.reservationId)
      
      expect(cancelResult.success).toBe(true)
      
      // Balance should remain unchanged
      const { balance } = renderHook(() => useCredits(), {
        wrapper: TestProviders
      }).result.current
      
      expect(balance).toBe(1000)
    })

    it('should handle reservation timeout', async () => {
      vi.useFakeTimers()
      
      const { result } = renderHook(() => useCreditDeduction(), {
        wrapper: TestProviders
      })
      
      // Reserve credits
      const reservation = await result.current.reserveCredits(100, 'vessel-tracking')
      
      // Fast forward past expiration (5 minutes)
      vi.advanceTimersByTime(6 * 60 * 1000)
      
      // Try to confirm expired reservation
      await expect(
        result.current.confirmReservation(reservation.reservationId)
      ).rejects.toThrow(/Reservation expired/)
      
      vi.useRealTimers()
    })
  })

  describe('Concurrent Deduction Handling', () => {
    it('should handle race conditions with concurrent deductions', async () => {
      const { result: deduction1 } = renderHook(() => useCreditDeduction(), {
        wrapper: TestProviders
      })
      const { result: deduction2 } = renderHook(() => useCreditDeduction(), {
        wrapper: TestProviders
      })
      
      // Attempt concurrent deductions
      const [result1, result2] = await Promise.allSettled([
        deduction1.current.deductCredits(600, 'Service 1'),
        deduction2.current.deductCredits(600, 'Service 2')
      ])
      
      // One should succeed, one should fail
      const succeeded = [result1, result2].filter(r => r.status === 'fulfilled')
      const failed = [result1, result2].filter(r => r.status === 'rejected')
      
      expect(succeeded).toHaveLength(1)
      expect(failed).toHaveLength(1)
      
      // Balance should reflect only one deduction
      const { balance } = renderHook(() => useCredits(), {
        wrapper: TestProviders
      }).result.current
      
      expect(balance).toBe(400) // 1000 - 600
    })
  })

  describe('Error Handling', () => {
    it('should show user-friendly error for network failures', async () => {
      server.use(
        http.post('*/credits/deduct', () => {
          return HttpResponse.error()
        })
      )
      
      const { result } = renderHook(() => useCreditDeduction(), {
        wrapper: TestProviders
      })
      
      await expect(
        result.current.deductCredits(100, 'Test')
      ).rejects.toThrow(/Network error/)
      
      // Check toast notification
      expect(screen.getByText(/Failed to deduct credits/i)).toBeInTheDocument()
    })

    it('should handle server errors gracefully', async () => {
      server.use(
        http.post('*/credits/deduct', () => {
          return HttpResponse.json(
            { error: 'Database connection failed' },
            { status: 500 }
          )
        })
      )
      
      const { result } = renderHook(() => useCreditDeduction(), {
        wrapper: TestProviders
      })
      
      await expect(
        result.current.deductCredits(100, 'Test')
      ).rejects.toThrow(/Database connection failed/)
    })
  })
})