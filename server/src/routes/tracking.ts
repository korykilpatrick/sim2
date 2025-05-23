import { Router } from 'express'
import { mockVessels, mockTrackingCriteria } from '../data/mockData'

const router = Router()

// Mock tracking data
const mockTrackings: any[] = []

// Get tracking criteria
router.get('/criteria', async (_req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  res.json({
    success: true,
    data: mockTrackingCriteria,
    timestamp: new Date().toISOString(),
  })
})

// Get user's vessel trackings
router.get('/vessels', async (_req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  res.json({
    success: true,
    data: mockTrackings,
    meta: {
      page: 1,
      limit: 10,
      total: mockTrackings.length,
      totalPages: Math.ceil(mockTrackings.length / 10),
    },
    timestamp: new Date().toISOString(),
  })
})

// Create vessel tracking
router.post('/vessels', async (req, res) => {
  const { vesselId, criteria, endDate } = req.body

  await new Promise((resolve) => setTimeout(resolve, 500))

  const vessel = mockVessels.find((v) => v.id === vesselId)

  if (!vessel) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Vessel not found',
        code: 'VESSEL_NOT_FOUND',
      },
    })
  }

  const newTracking = {
    id: `vt-${Date.now()}`,
    vesselId,
    vessel,
    criteria: mockTrackingCriteria.filter((c) => criteria.includes(c.id)),
    status: 'active',
    startDate: new Date().toISOString(),
    endDate,
    alertsCount: 0,
    creditsPerDay: criteria.length * 5, // 5 credits per criteria
    userId: 'user-1',
  }

  mockTrackings.push(newTracking)

  res.json({
    success: true,
    data: newTracking,
    timestamp: new Date().toISOString(),
  })
})

// Calculate tracking cost
router.post('/calculate-cost', async (req, res) => {
  const { criteria, days } = req.body

  await new Promise((resolve) => setTimeout(resolve, 200))

  const creditsPerDay = criteria.length * 5 // 5 credits per criteria
  const totalCredits = creditsPerDay * days

  res.json({
    success: true,
    data: {
      creditsPerDay,
      totalCredits,
    },
    timestamp: new Date().toISOString(),
  })
})

export default router
