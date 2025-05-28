import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import {
  renderWithProviders,
  setupAuthenticatedUser,
  clearAuth,
} from '../../utils/test-helpers'
import { userEvent } from '../../utils/test-utils'
import { server, resetMockData } from '../../utils/api-mocks'
import { http, HttpResponse } from 'msw'
import { ReportsPage } from '@/features/reports/pages/ReportsPage'
import { InvestigationsPage } from '@/features/investigations/pages/InvestigationsPage'
import { FleetsPage } from '@/features/fleet/pages/FleetsPage'
import { VesselTrackingPage } from '@/features/vessels/pages/VesselTrackingPage'
import { AreaMonitoringPage } from '@/features/areas/pages/AreaMonitoringPage'

beforeEach(() => {
  setupAuthenticatedUser()
  resetMockData()
})

afterEach(() => {
  clearAuth()
  vi.clearAllMocks()
})

describe('Service-Specific Credit Integration', () => {
  describe('Report Generation Credits', () => {
    it('should show credit cost before generating report', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ReportsPage />)

      // Start new report
      const newReportBtn = await screen.findByText(/Generate New Report/i)
      await user.click(newReportBtn)

      // Select report type
      const complianceOption = screen.getByLabelText(/Compliance Report/i)
      await user.click(complianceOption)

      // Should show cost
      expect(screen.getByText(/Cost: 50 credits/i)).toBeInTheDocument()

      // Select chronology report
      const chronologyOption = screen.getByLabelText(/Chronology Report/i)
      await user.click(chronologyOption)

      // Should update cost
      expect(screen.getByText(/Cost: 75 credits/i)).toBeInTheDocument()
    })

    it('should deduct credits when generating report', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ReportsPage />)

      // Check initial balance
      await waitFor(() => {
        expect(screen.getByTestId('credit-balance')).toHaveTextContent('1,000')
      })

      // Generate compliance report
      const newReportBtn = await screen.findByText(/Generate New Report/i)
      await user.click(newReportBtn)

      const complianceOption = screen.getByLabelText(/Compliance Report/i)
      await user.click(complianceOption)

      // Select vessel
      const vesselSelect = screen.getByLabelText(/Select Vessel/i)
      await user.selectOptions(vesselSelect, 'vessel-1')

      // Configure report
      const dateRangeSelect = screen.getByLabelText(/Date Range/i)
      await user.selectOptions(dateRangeSelect, 'last30days')

      // Generate report
      const generateBtn = screen.getByText(/Generate Report/i)
      await user.click(generateBtn)

      // Should show processing
      expect(screen.getByText(/Generating report/i)).toBeInTheDocument()

      // Wait for completion
      await waitFor(() => {
        expect(
          screen.getByText(/Report generated successfully/i),
        ).toBeInTheDocument()
      })

      // Balance should be updated
      expect(screen.getByTestId('credit-balance')).toHaveTextContent('950')
    })

    it('should prevent report generation with insufficient credits', async () => {
      // Set low balance
      server.use(
        http.get('*/credits/balance', () => {
          return HttpResponse.json({
            current: 30,
            lifetime: 5000,
            expiringCredits: [],
          })
        }),
      )

      const user = userEvent.setup()
      renderWithProviders(<ReportsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('credit-balance')).toHaveTextContent('30')
      })

      const newReportBtn = await screen.findByText(/Generate New Report/i)
      await user.click(newReportBtn)

      const complianceOption = screen.getByLabelText(/Compliance Report/i)
      await user.click(complianceOption)

      // Should show insufficient credits warning
      expect(screen.getByText(/Insufficient credits/i)).toBeInTheDocument()
      expect(screen.getByText(/You need 20 more credits/i)).toBeInTheDocument()

      // Generate button should be disabled
      const generateBtn = screen.getByText(/Generate Report/i)
      expect(generateBtn).toBeDisabled()
    })
  })

  describe('Investigation Credits', () => {
    it('should show investigation costs upfront', async () => {
      const user = userEvent.setup()
      renderWithProviders(<InvestigationsPage />)

      // Request new investigation
      const newInvestigationBtn = await screen.findByText(
        /Request Investigation/i,
      )
      await user.click(newInvestigationBtn)

      // Show investigation types with costs
      await waitFor(() => {
        const basicOption = screen.getByTestId('investigation-basic')
        const comprehensiveOption = screen.getByTestId(
          'investigation-comprehensive',
        )

        expect(
          within(basicOption).getByText(/5,000 credits/i),
        ).toBeInTheDocument()
        expect(
          within(comprehensiveOption).getByText(/10,000 credits/i),
        ).toBeInTheDocument()
      })
    })

    it('should handle large credit deductions for investigations', async () => {
      // Set balance high enough for basic investigation
      server.use(
        http.get('*/credits/balance', () => {
          return HttpResponse.json({
            current: 6000,
            lifetime: 10000,
            expiringCredits: [],
          })
        }),
      )

      const user = userEvent.setup()
      renderWithProviders(<InvestigationsPage />)

      await waitFor(() => {
        expect(screen.getByTestId('credit-balance')).toHaveTextContent('6,000')
      })

      // Request investigation
      const newInvestigationBtn = await screen.findByText(
        /Request Investigation/i,
      )
      await user.click(newInvestigationBtn)

      // Select basic investigation
      const basicOption = screen.getByTestId('investigation-basic')
      await user.click(basicOption)

      // Fill investigation details
      const vesselInput = screen.getByLabelText(/Vessel Name/i)
      await user.type(vesselInput, 'Suspicious Vessel')

      const descriptionInput = screen.getByLabelText(/Description/i)
      await user.type(descriptionInput, 'Unusual activity detected')

      // Submit investigation
      const submitBtn = screen.getByText(/Submit Investigation Request/i)
      await user.click(submitBtn)

      // Confirm high credit deduction
      await waitFor(() => {
        const confirmDialog = screen.getByRole('dialog')
        expect(
          within(confirmDialog).getByText(/Confirm 5,000 credit deduction/i),
        ).toBeInTheDocument()
      })

      const confirmBtn = screen.getByText(/Confirm/i)
      await user.click(confirmBtn)

      // Wait for completion
      await waitFor(() => {
        expect(
          screen.getByText(/Investigation requested successfully/i),
        ).toBeInTheDocument()
      })

      // Balance should be updated
      expect(screen.getByTestId('credit-balance')).toHaveTextContent('1,000')
    })

    it('should show credit package suggestions for expensive investigations', async () => {
      // Set balance too low for any investigation
      server.use(
        http.get('*/credits/balance', () => {
          return HttpResponse.json({
            current: 2000,
            lifetime: 5000,
            expiringCredits: [],
          })
        }),
      )

      const user = userEvent.setup()
      renderWithProviders(<InvestigationsPage />)

      const newInvestigationBtn = await screen.findByText(
        /Request Investigation/i,
      )
      await user.click(newInvestigationBtn)

      // Try to select comprehensive investigation
      const comprehensiveOption = screen.getByTestId(
        'investigation-comprehensive',
      )
      await user.click(comprehensiveOption)

      // Should show insufficient credits with package suggestions
      await waitFor(() => {
        expect(
          screen.getByText(/You need 8,000 more credits/i),
        ).toBeInTheDocument()
        expect(
          screen.getByText(/Suggested credit packages:/i),
        ).toBeInTheDocument()
        expect(screen.getByText(/5,000 credits for \$350/i)).toBeInTheDocument()
      })

      // Should link to purchase
      const purchaseLink = screen.getByText(/Purchase Credits/i)
      expect(purchaseLink).toHaveAttribute(
        'href',
        '/credits?purchase=true&amount=5000',
      )
    })
  })

  describe('Fleet Tracking Credits', () => {
    it('should calculate fleet tracking costs based on vessel count', async () => {
      const user = userEvent.setup()
      renderWithProviders(<FleetsPage />)

      // Create new fleet
      const createFleetBtn = await screen.findByText(/Create Fleet/i)
      await user.click(createFleetBtn)

      const fleetNameInput = screen.getByLabelText(/Fleet Name/i)
      await user.type(fleetNameInput, 'Test Fleet')

      // Add vessels to fleet
      const addVesselBtn = screen.getByText(/Add Vessel/i)

      // Add 15 vessels (should trigger discount)
      for (let i = 0; i < 15; i++) {
        await user.click(addVesselBtn)
        const vesselInput = screen
          .getAllByPlaceholderText(/Search vessels/i)
          .at(-1)!
        await user.type(vesselInput, `Vessel ${i}`)

        const vesselOption = await screen.findByText(`Vessel ${i}`)
        await user.click(vesselOption)
      }

      // Set monitoring duration
      const durationSelect = screen.getByLabelText(/Monitoring Duration/i)
      await user.selectOptions(durationSelect, '3') // 3 months

      // Should show cost with breakdown
      await waitFor(() => {
        const costBreakdown = screen.getByTestId('fleet-cost-breakdown')
        expect(
          within(costBreakdown).getByText(/15 vessels/i),
        ).toBeInTheDocument()
        expect(
          within(costBreakdown).getByText(/100 credits per vessel per month/i),
        ).toBeInTheDocument()
        expect(within(costBreakdown).getByText(/3 months/i)).toBeInTheDocument()
        expect(
          within(costBreakdown).getByText(/Subtotal: 4,500 credits/i),
        ).toBeInTheDocument()
        expect(
          within(costBreakdown).getByText(/No bulk discount/i),
        ).toBeInTheDocument() // 15 vessels = no discount
        expect(
          within(costBreakdown).getByText(/Total: 4,500 credits/i),
        ).toBeInTheDocument()
      })
    })

    it('should apply bulk discounts for large fleets', async () => {
      const user = userEvent.setup()
      renderWithProviders(<FleetsPage />)

      // Mock a fleet with 30 vessels (10% discount)
      server.use(
        http.post('*/fleets/calculate-cost', async ({ request }) => {
          const body = await request.json()
          const baseCost = body.vesselCount * 100 * body.durationMonths
          const discount = body.vesselCount >= 20 ? 0.1 : 0
          const finalCost = baseCost * (1 - discount)

          return HttpResponse.json({
            baseCost,
            discount: discount * 100,
            finalCost,
            breakdown: {
              vesselCount: body.vesselCount,
              costPerVessel: 100,
              durationMonths: body.durationMonths,
            },
          })
        }),
      )

      // Create fleet with many vessels
      const createFleetBtn = await screen.findByText(/Create Fleet/i)
      await user.click(createFleetBtn)

      // Simulate adding 30 vessels
      const vesselCountInput = screen.getByLabelText(/Number of Vessels/i)
      await user.clear(vesselCountInput)
      await user.type(vesselCountInput, '30')

      // Should show discount
      await waitFor(() => {
        const costBreakdown = screen.getByTestId('fleet-cost-breakdown')
        expect(
          within(costBreakdown).getByText(/30 vessels/i),
        ).toBeInTheDocument()
        expect(
          within(costBreakdown).getByText(/10% bulk discount/i),
        ).toBeInTheDocument()
        expect(
          within(costBreakdown).getByText(/Subtotal: 3,000 credits/i),
        ).toBeInTheDocument()
        expect(
          within(costBreakdown).getByText(/Discount: -300 credits/i),
        ).toBeInTheDocument()
        expect(
          within(costBreakdown).getByText(/Total: 2,700 credits/i),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Credit Warnings Across Services', () => {
    it('should show consistent low balance warnings', async () => {
      // Set balance to trigger warning
      server.use(
        http.get('*/credits/balance', () => {
          return HttpResponse.json({
            current: 45,
            lifetime: 5000,
            expiringCredits: [],
          })
        }),
      )

      // Check vessel tracking page
      const { unmount: unmount1 } = renderWithProviders(<VesselTrackingPage />)
      await waitFor(() => {
        expect(screen.getByTestId('low-balance-warning')).toBeInTheDocument()
        expect(
          screen.getByText(/Low credit balance: 45 credits/i),
        ).toBeInTheDocument()
      })
      unmount1()

      // Check area monitoring page
      const { unmount: unmount2 } = renderWithProviders(<AreaMonitoringPage />)
      await waitFor(() => {
        expect(screen.getByTestId('low-balance-warning')).toBeInTheDocument()
        expect(
          screen.getByText(/Low credit balance: 45 credits/i),
        ).toBeInTheDocument()
      })
      unmount2()

      // Check reports page
      renderWithProviders(<ReportsPage />)
      await waitFor(() => {
        expect(screen.getByTestId('low-balance-warning')).toBeInTheDocument()
        expect(
          screen.getByText(/Low credit balance: 45 credits/i),
        ).toBeInTheDocument()
      })
    })

    it('should update warnings in real-time across services', async () => {
      renderWithProviders(<ReportsPage />)

      // Initially no warning
      await waitFor(() => {
        expect(screen.getByTestId('credit-balance')).toHaveTextContent('1,000')
      })
      expect(
        screen.queryByTestId('low-balance-warning'),
      ).not.toBeInTheDocument()

      // Simulate credit deduction via WebSocket
      const wsEvent = new CustomEvent('ws:credit-update', {
        detail: { newBalance: 25 },
      })
      window.dispatchEvent(wsEvent)

      // Warning should appear
      await waitFor(() => {
        expect(screen.getByTestId('low-balance-warning')).toBeInTheDocument()
        expect(
          screen.getByText(/Critical: Very low credit balance/i),
        ).toBeInTheDocument()
      })
    })
  })
})
