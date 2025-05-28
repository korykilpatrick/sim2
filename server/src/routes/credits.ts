import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { mockUsers } from '../data/mockData'

const router = Router()

interface CreditTransaction {
  id: string
  type: 'purchase' | 'usage' | 'refund'
  description: string
  amount: number
  balance: number
  createdAt: string
  packageId?: string
  service?: string
  referenceId?: string
}

// Credit balance store (separate from user data)
const creditBalances = new Map<string, number>()

// Initialize demo user with 1000 credits
creditBalances.set('1', 1000)

// Credit transaction history
const creditTransactions = new Map<string, CreditTransaction[]>()

// Get current credit balance
router.get('/balance', authenticateToken, (req, res) => {
  const userId = req.user!.userId
  const user = mockUsers.find((u) => u.id === userId)

  if (!user) {
    return res.status(404).json({ error: { message: 'User not found' } })
  }

  const balance = creditBalances.get(userId) || 0
  
  res.json({
    current: balance,
    lifetime: balance + 500, // Mock lifetime credits
    expiringCredits: {
      amount: 100,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  })
})

// Get transaction history
router.get('/transactions', authenticateToken, (req, res) => {
  const userId = req.user!.userId
  const limit = parseInt(req.query.limit as string) || 50
  const offset = parseInt(req.query.offset as string) || 0

  const userTransactions = creditTransactions.get(userId) || []
  const paginatedTransactions = userTransactions.slice(offset, offset + limit)

  res.json(paginatedTransactions)
})

// Purchase credits (mock)
router.post('/purchase', authenticateToken, (req, res) => {
  const userId = req.user!.userId
  const { packageId } = req.body

  const user = mockUsers.find((u) => u.id === userId)
  if (!user) {
    return res.status(404).json({ error: { message: 'User not found' } })
  }

  // Mock credit packages
  const packages: Record<string, { credits: number; price: number }> = {
    starter: { credits: 100, price: 99 },
    professional: { credits: 500, price: 449 },
    business: { credits: 1000, price: 849 },
    enterprise: { credits: 5000, price: 3999 },
    custom: { credits: 10000, price: 7499 },
  }

  const selectedPackage = packages[packageId]
  if (!selectedPackage) {
    return res.status(400).json({ error: { message: 'Invalid package' } })
  }

  // Update credit balance
  const currentBalance = creditBalances.get(userId) || 0
  const newBalance = currentBalance + selectedPackage.credits
  creditBalances.set(userId, newBalance)

  // Add transaction
  const transaction: CreditTransaction = {
    id: Date.now().toString(),
    type: 'purchase' as const,
    description: `Purchased ${selectedPackage.credits} credits`,
    amount: selectedPackage.credits,
    balance: newBalance,
    createdAt: new Date().toISOString(),
    packageId,
  }

  const userTransactions = creditTransactions.get(userId) || []
  userTransactions.unshift(transaction)
  creditTransactions.set(userId, userTransactions)

  res.json({
    transactionId: transaction.id,
    creditsAdded: selectedPackage.credits,
    newBalance: newBalance,
    invoice: {
      id: `INV-${Date.now()}`,
      url: `/invoices/INV-${Date.now()}.pdf`,
    },
  })
})

// Deduct credits
router.post('/deduct', authenticateToken, (req, res) => {
  const userId = req.user!.userId
  const { amount, description, serviceId, serviceType } = req.body

  const user = mockUsers.find((u) => u.id === userId)
  if (!user) {
    return res.status(404).json({ error: { message: 'User not found' } })
  }

  const currentBalance = creditBalances.get(userId) || 0
  
  if (currentBalance < amount) {
    return res.status(400).json({ error: { message: 'Insufficient credits' } })
  }

  const previousBalance = currentBalance
  const newBalance = currentBalance - amount
  creditBalances.set(userId, newBalance)

  // Add transaction
  const transaction: CreditTransaction = {
    id: Date.now().toString(),
    type: 'usage' as const,
    description,
    amount: -amount,
    balance: newBalance,
    service: serviceType,
    referenceId: serviceId,
    createdAt: new Date().toISOString(),
  }

  const userTransactions = creditTransactions.get(userId) || []
  userTransactions.unshift(transaction)
  creditTransactions.set(userId, userTransactions)

  // Return response matching our expected format
  res.json({
    data: {
      transactionId: transaction.id,
      previousBalance,
      newBalance: newBalance,
      deductedAmount: amount,
      timestamp: transaction.createdAt,
    },
    success: true,
  })
})

export default router
