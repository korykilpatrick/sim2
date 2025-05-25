import { Router } from 'express'
import type { Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Helper to generate time series data
const generateTimeSeriesData = (
  days: number,
  baseValue: number,
  variance: number,
) => {
  const data = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const randomVariance = (Math.random() - 0.5) * variance
    const trendMultiplier = 1 + (days - i) * 0.01
    const value = Math.round((baseValue + randomVariance) * trendMultiplier)

    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(0, value),
    })
  }

  return data
}

// Mock product stats
const productStats = [
  {
    productId: 'vts',
    productName: 'Vessel Tracking Service',
    activeUsers: 1847,
    totalUsage: 12453,
    revenue: 248600,
    trend: 12.5,
  },
  {
    productId: 'ams',
    productName: 'Area Monitoring Service',
    activeUsers: 923,
    totalUsage: 5672,
    revenue: 156800,
    trend: 8.3,
  },
  {
    productId: 'vcr',
    productName: 'Compliance Reports',
    activeUsers: 456,
    totalUsage: 2134,
    revenue: 89400,
    trend: -2.1,
  },
  {
    productId: 'vchr',
    productName: 'Chronology Reports',
    activeUsers: 312,
    totalUsage: 1456,
    revenue: 67200,
    trend: 15.7,
  },
  {
    productId: 'fts',
    productName: 'Fleet Tracking Service',
    activeUsers: 234,
    totalUsage: 892,
    revenue: 112000,
    trend: 22.4,
  },
  {
    productId: 'mis',
    productName: 'Maritime Investigations',
    activeUsers: 89,
    totalUsage: 156,
    revenue: 178000,
    trend: 5.2,
  },
]

// Get analytics overview
router.get('/overview', authenticateToken, (req: Request, res: Response) => {
  const { timeRange = 'month' } = req.query
  const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90

  const overview = {
    revenue: {
      total: 852000,
      change: 15.3,
      chartData: generateTimeSeriesData(days, 28000, 5000),
    },
    users: {
      total: 3456,
      active: 2134,
      new: 234,
      change: 8.7,
      chartData: generateTimeSeriesData(days, 100, 20),
    },
    products: {
      topProducts: productStats.slice(0, 4),
      totalCreditsUsed: 45678,
      averageCreditsPerUser: 21.4,
    },
    engagement: {
      averageSessionDuration: 1823,
      featuresAdopted: 4.2,
      totalFeatures: 6,
      conversionRate: 23.4,
    },
  }

  res.json(overview)
})

// Get user activity logs
router.get('/activity', authenticateToken, (req: Request, res: Response) => {
  const { limit = 20 } = req.query

  const actions = [
    { action: 'Started vessel tracking', product: 'VTS', credits: 10 },
    { action: 'Generated compliance report', product: 'VCR', credits: 25 },
    { action: 'Created area monitoring zone', product: 'AMS', credits: 15 },
    { action: 'Requested investigation', product: 'MIS', credits: 100 },
    { action: 'Generated chronology report', product: 'VChR', credits: 30 },
    { action: 'Added vessel to fleet', product: 'FTS', credits: 5 },
  ]

  const users = [
    { id: 'usr_1', name: 'John Smith' },
    { id: 'usr_2', name: 'Sarah Johnson' },
    { id: 'usr_3', name: 'Michael Chen' },
    { id: 'usr_4', name: 'Emma Wilson' },
    { id: 'usr_5', name: 'David Brown' },
  ]

  const logs = []
  const now = new Date()

  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const activity = actions[Math.floor(Math.random() * actions.length)]
    const timestamp = new Date(
      now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000,
    )

    logs.push({
      id: `log_${i + 1}`,
      userId: user.id,
      userName: user.name,
      action: activity.action,
      product: activity.product,
      timestamp: timestamp.toISOString(),
      creditsUsed: activity.credits,
    })
  }

  const sortedLogs = logs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  res.json(sortedLogs.slice(0, parseInt(limit as string)))
})

// Get revenue breakdown
router.get(
  '/revenue/breakdown',
  authenticateToken,
  (req: Request, res: Response) => {
    const totalRevenue = productStats.reduce(
      (sum, product) => sum + product.revenue,
      0,
    )

    const breakdown = productStats.map((product) => ({
      productId: product.productId,
      productName: product.productName,
      revenue: product.revenue,
      percentage: (product.revenue / totalRevenue) * 100,
      transactions: Math.floor(product.totalUsage * 0.7),
    }))

    res.json(breakdown)
  },
)

// Export analytics data
router.get('/export', authenticateToken, (req: Request, res: Response) => {
  const { format = 'csv', timeRange = 'month' } = req.query

  // Mock CSV export
  const csv = [
    'Metric,Value,Change',
    'Total Revenue,$852000,+15.3%',
    'Active Users,2134,+8.7%',
    'New Users,234,',
    'Credits Used,45678,',
    'Avg Credits/User,21.4,',
    'Conversion Rate,23.4%,',
  ].join('\n')

  res.setHeader(
    'Content-Type',
    format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel',
  )
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=analytics-${timeRange}.${format === 'csv' ? 'csv' : 'xlsx'}`,
  )
  res.send(csv)
})

export default router
