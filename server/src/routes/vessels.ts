import { Router } from 'express'
import { mockVessels } from '../data/mockData'

const router = Router()

// Search vessels
router.get('/', async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query

  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 300))

  let filteredVessels = [...mockVessels]

  // Simple search filter
  if (query) {
    const searchQuery = String(query).toLowerCase()
    filteredVessels = filteredVessels.filter(v =>
      v.name.toLowerCase().includes(searchQuery) ||
      v.imo.includes(searchQuery) ||
      v.mmsi.includes(searchQuery)
    )
  }

  // Pagination
  const startIndex = (Number(page) - 1) * Number(limit)
  const endIndex = startIndex + Number(limit)
  const paginatedVessels = filteredVessels.slice(startIndex, endIndex)

  res.json({
    success: true,
    data: paginatedVessels,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total: filteredVessels.length,
      totalPages: Math.ceil(filteredVessels.length / Number(limit)),
    },
    timestamp: new Date().toISOString(),
  })
})

// Get vessel by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params

  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 200))

  const vessel = mockVessels.find(v => v.id === id)

  if (!vessel) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Vessel not found',
        code: 'NOT_FOUND',
      },
    })
  }

  res.json({
    success: true,
    data: vessel,
    timestamp: new Date().toISOString(),
  })
})

export default router