import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { 
  CreditBalance, 
  CreditTransaction, 
  CreditPackage,
  CreditDeductionResponse,
  CreditPurchaseResponse 
} from '@/features/shared/types/credits'

// Use wildcard pattern to match any origin
const API_BASE_URL = '*/api/v1'

// Default mock data
export const mockCreditBalance: CreditBalance = {
  available: 1000,
  lifetime: 5000,
  expiring: {
    amount: 150,
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
}

export const mockTransactions: CreditTransaction[] = [
  {
    id: 'tx-1',
    userId: 'user-1',
    type: 'purchase',
    amount: 500,
    balance: 1500,
    description: 'Credit package purchase',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tx-2',
    userId: 'user-1',
    type: 'deduction',
    amount: -50,
    balance: 1450,
    description: 'Vessel tracking - 10 days',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
]

export const mockCreditPackages: CreditPackage[] = [
  { credits: 100, price: 10, savings: 0 },
  { credits: 500, price: 45, savings: 10 },
  { credits: 1000, price: 80, savings: 20 },
  { credits: 5000, price: 350, savings: 30 }
]

// API handlers
export const creditHandlers = [
  // Get credit balance
  http.get(`${API_BASE_URL}/credits/balance`, () => {
    return HttpResponse.json({
      success: true,
      data: mockCreditBalance,
      timestamp: new Date().toISOString()
    })
  }),

  // Get credit transactions
  http.get(`${API_BASE_URL}/credits/transactions`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedTransactions = mockTransactions.slice(start, end)
    
    return HttpResponse.json({
      transactions: paginatedTransactions,
      total: mockTransactions.length,
      page,
      totalPages: Math.ceil(mockTransactions.length / limit)
    })
  }),

  // Deduct credits
  http.post(`${API_BASE_URL}/credits/deduct`, async ({ request }) => {
    const body = await request.json() as { amount: number; description: string }
    
    if (body.amount > mockCreditBalance.available) {
      return HttpResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      )
    }
    
    const newBalance = mockCreditBalance.available - body.amount
    const transactionId = `tx-${Date.now()}`
    
    // Add transaction to history
    mockTransactions.unshift({
      id: transactionId,
      userId: 'user-1',
      type: 'deduction',
      amount: -body.amount,
      balance: newBalance,
      description: body.description,
      createdAt: new Date().toISOString()
    })
    
    // Update mock balance for subsequent requests
    mockCreditBalance.available = newBalance
    
    const response: CreditDeductionResponse = {
      transactionId,
      previousBalance: mockCreditBalance.available,
      newBalance,
      deductedAmount: body.amount,
      timestamp: new Date().toISOString()
    }
    
    return HttpResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    })
  }),

  // Purchase credits
  http.post(`${API_BASE_URL}/credits/purchase`, async ({ request }) => {
    const body = await request.json() as { credits: number; paymentMethodId: string }
    
    const pkg = mockCreditPackages.find(p => p.credits === body.credits)
    if (!pkg) {
      return HttpResponse.json(
        { error: 'Invalid credit package' },
        { status: 400 }
      )
    }
    
    const newBalance = mockCreditBalance.available + body.credits
    const transactionId = `tx-${Date.now()}`
    
    // Add transaction to history
    mockTransactions.unshift({
      id: transactionId,
      userId: 'user-1',
      type: 'purchase',
      amount: body.credits,
      balance: newBalance,
      description: `Purchased ${body.credits} credits`,
      createdAt: new Date().toISOString()
    })
    
    // Update mock balance
    mockCreditBalance.available = newBalance
    
    const response: CreditPurchaseResponse = {
      transactionId,
      creditsAdded: body.credits,
      newBalance,
      invoiceUrl: '/invoices/mock-invoice.pdf'
    }
    
    return HttpResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    })
  }),

  // Reserve credits
  http.post(`${API_BASE_URL}/credits/reserve`, async ({ request }) => {
    const body = await request.json() as { amount: number; serviceType: string }
    
    if (body.amount > mockCreditBalance.available) {
      return HttpResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      )
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        reservationId: `res-${Date.now()}`
      },
      timestamp: new Date().toISOString()
    })
  }),

  // Confirm reservation
  http.post(`${API_BASE_URL}/credits/confirm`, async () => {
    // Simulate reservation confirmation
    const amount = 50 // Would normally be stored with reservation
    const previousBalance = mockCreditBalance.available
    const newBalance = previousBalance - amount
    
    mockCreditBalance.available = newBalance
    
    const response: CreditDeductionResponse = {
      transactionId: `tx-${Date.now()}`,
      previousBalance,
      newBalance,
      deductedAmount: amount,
      timestamp: new Date().toISOString()
    }
    
    return HttpResponse.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    })
  }),

  // Cancel reservation
  http.post(`${API_BASE_URL}/credits/cancel`, async () => {
    return HttpResponse.json({
      success: true,
      data: null,
      timestamp: new Date().toISOString()
    })
  })
]

// Error simulation handlers
export const creditErrorHandlers = {
  networkError: http.get(`${API_BASE_URL}/credits/balance`, () => {
    return HttpResponse.error()
  }),
  
  serverError: http.get(`${API_BASE_URL}/credits/balance`, () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }),
  
  unauthorized: http.get(`${API_BASE_URL}/credits/balance`, () => {
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  })
}

// Auth handlers
export const authHandlers = [
  // Get current user
  http.get(`${API_BASE_URL}/auth/me`, () => {
    return HttpResponse.json({
      data: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        company: 'Test Company',
        credits: 1000,
        role: 'user',
        createdAt: new Date().toISOString()
      }
    })
  }),

  // Refresh token
  http.post(`${API_BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      data: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      }
    })
  })
]

// Setup MSW server with all handlers
export const server = setupServer(...creditHandlers, ...authHandlers)

// Log registered handlers
// Uncomment for debugging MSW handler registration
// console.log('MSW: Registered handlers:', {
//   creditHandlers: creditHandlers.map(h => `${h.info.method} ${h.info.path}`),
//   authHandlers: authHandlers.map(h => `${h.info.method} ${h.info.path}`)
// })

// Helper to reset mock data between tests
export const resetMockData = () => {
  mockCreditBalance.available = 1000
  mockCreditBalance.lifetime = 5000
  mockCreditBalance.expiring = {
    amount: 150,
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
}