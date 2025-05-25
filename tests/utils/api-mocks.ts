import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { 
  CreditBalance, 
  CreditTransaction, 
  CreditPackage,
  DeductCreditsResponse,
  PurchaseCreditsResponse 
} from '@/features/shared/types/credits'

const API_BASE_URL = 'http://localhost:3001/api'

// Default mock data
export const mockCreditBalance: CreditBalance = {
  current: 1000,
  lifetime: 5000,
  expiringCredits: [
    { amount: 100, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
    { amount: 50, expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() }
  ]
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
    return HttpResponse.json(mockCreditBalance)
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
    
    if (body.amount > mockCreditBalance.current) {
      return HttpResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      )
    }
    
    const newBalance = mockCreditBalance.current - body.amount
    const response: DeductCreditsResponse = {
      success: true,
      newBalance,
      transaction: {
        id: `tx-${Date.now()}`,
        userId: 'user-1',
        type: 'deduction',
        amount: -body.amount,
        balance: newBalance,
        description: body.description,
        createdAt: new Date().toISOString()
      }
    }
    
    // Update mock balance for subsequent requests
    mockCreditBalance.current = newBalance
    
    return HttpResponse.json(response)
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
    
    const newBalance = mockCreditBalance.current + body.credits
    const response: PurchaseCreditsResponse = {
      success: true,
      newBalance,
      transaction: {
        id: `tx-${Date.now()}`,
        userId: 'user-1',
        type: 'purchase',
        amount: body.credits,
        balance: newBalance,
        description: `Purchased ${body.credits} credits`,
        createdAt: new Date().toISOString()
      }
    }
    
    // Update mock balance
    mockCreditBalance.current = newBalance
    
    return HttpResponse.json(response)
  }),

  // Reserve credits
  http.post(`${API_BASE_URL}/credits/reserve`, async ({ request }) => {
    const body = await request.json() as { amount: number; serviceType: string }
    
    if (body.amount > mockCreditBalance.current) {
      return HttpResponse.json(
        { error: 'Insufficient credits' },
        { status: 400 }
      )
    }
    
    return HttpResponse.json({
      reservationId: `res-${Date.now()}`,
      amount: body.amount,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 min expiry
    })
  }),

  // Confirm reservation
  http.post(`${API_BASE_URL}/credits/confirm-reservation`, async () => {
    // Simulate reservation confirmation
    const amount = 50 // Would normally be stored with reservation
    const newBalance = mockCreditBalance.current - amount
    
    mockCreditBalance.current = newBalance
    
    return HttpResponse.json({
      success: true,
      newBalance,
      transaction: {
        id: `tx-${Date.now()}`,
        userId: 'user-1',
        type: 'deduction',
        amount: -amount,
        balance: newBalance,
        description: 'Reservation confirmed',
        createdAt: new Date().toISOString()
      }
    })
  }),

  // Cancel reservation
  http.post(`${API_BASE_URL}/credits/cancel-reservation`, async () => {
    return HttpResponse.json({
      success: true,
      message: 'Reservation cancelled'
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

// Setup MSW server
export const server = setupServer(...creditHandlers)

// Helper to reset mock data between tests
export const resetMockData = () => {
  mockCreditBalance.current = 1000
  mockCreditBalance.lifetime = 5000
  mockCreditBalance.expiringCredits = [
    { amount: 100, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
    { amount: 50, expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() }
  ]
}