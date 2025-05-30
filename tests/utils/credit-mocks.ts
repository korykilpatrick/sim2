import { http, HttpResponse } from 'msw'

// Use wildcard pattern to match any origin
const API_BASE_URL = '*/api/v1'

// Mock data for unified credit system
export const mockCreditBalanceFeatures = {
  available: 1000,
  lifetime: 5000,
  expiring: {
    amount: 100,
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
}

export const mockCreditTransactions = [
  {
    id: 'tx-1',
    userId: 'user-1',
    type: 'purchase',
    amount: 500,
    balance: 1500,
    description: 'Credit package purchase',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-2',
    userId: 'user-1',
    type: 'deduction',
    amount: -50,
    balance: 1450,
    description: 'Vessel tracking - 10 days',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock credit packages for testing
export const mockCreditPackages = [
  {
    id: 'pkg-100',
    name: 'Starter',
    credits: 100,
    price: 10.0,
    bonus: 0,
    popular: false,
  },
  {
    id: 'pkg-500',
    name: 'Professional',
    credits: 500,
    price: 45.0,
    bonus: 0,
    popular: false,
  },
  {
    id: 'pkg-1000',
    name: 'Business',
    credits: 1000,
    price: 80.0,
    bonus: 0,
    popular: true,
  },
  {
    id: 'pkg-5000',
    name: 'Enterprise',
    credits: 5000,
    price: 350.0,
    bonus: 0,
    popular: false,
  },
]

// Handlers for features/credits endpoints
export const featuresCreditHandlers = [
  // Get credit balance - returns format expected by features/credits
  http.get(`${API_BASE_URL}/credits/balance`, () => {
    return HttpResponse.json({
      success: true,
      data: mockCreditBalanceFeatures,
      timestamp: new Date().toISOString(),
    })
  }),

  // Get transactions
  http.get(`${API_BASE_URL}/credits/transactions`, () => {
    return HttpResponse.json({
      success: true,
      data: mockCreditTransactions,
      timestamp: new Date().toISOString(),
    })
  }),

  // Get available packages
  http.get(`${API_BASE_URL}/credits/packages`, () => {
    return HttpResponse.json({
      success: true,
      data: mockCreditPackages,
      timestamp: new Date().toISOString(),
    })
  }),

  // Purchase credits
  http.post(`${API_BASE_URL}/credits/purchase`, async ({ request }) => {
    const body = (await request.json()) as {
      credits?: number
      paymentMethodId?: string
    }
    // Mock successful purchase
    const creditsAdded = body.credits || 500
    const newBalance = mockCreditBalanceFeatures.available + creditsAdded
    mockCreditBalanceFeatures.available = newBalance

    return HttpResponse.json({
      success: true,
      data: {
        transactionId: `tx-${Date.now()}`,
        creditsAdded,
        newBalance,
        invoice: {
          id: `inv-${Date.now()}`,
          url: '/invoices/mock-invoice.pdf',
        },
      },
      timestamp: new Date().toISOString(),
    })
  }),

  // Deduct credits - for features/credits
  http.post(`${API_BASE_URL}/credits/deduct`, async ({ request }) => {
    const body = (await request.json()) as {
      amount: number
      description?: string
    }

    if (body.amount > mockCreditBalanceFeatures.available) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            message: 'Insufficient credits',
            code: 'INSUFFICIENT_CREDITS',
          },
        },
        { status: 400 },
      )
    }

    const newBalance = mockCreditBalanceFeatures.available - body.amount
    mockCreditBalanceFeatures.available = newBalance

    return HttpResponse.json({
      success: true,
      data: {
        success: true,
        newBalance,
        transactionId: `tx-${Date.now()}`,
      },
      timestamp: new Date().toISOString(),
    })
  }),
]

// Reset helper
export const resetFeaturesCreditData = () => {
  mockCreditBalanceFeatures.available = 1000
  mockCreditBalanceFeatures.lifetime = 5000
  mockCreditBalanceFeatures.expiring = {
    amount: 100,
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }
}
