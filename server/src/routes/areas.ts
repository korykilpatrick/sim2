import { Router } from 'express'
import { calculateAreaMonitoringCostDetailed } from '../../../src/features/shared/utils/pricing'

const router = Router()

// Mock monitoring criteria
const mockMonitoringCriteria = [
  {
    id: 'vessel-entry-exit',
    name: 'Vessel Entry & Exit',
    description: 'Alerts when vessels enter or leave the defined area',
    category: 'movement',
    creditsPerAlert: 2,
  },
  {
    id: 'ais-reporting',
    name: 'AIS Reporting',
    description: 'Regular AIS position updates at your chosen interval',
    category: 'tracking',
    creditsPerAlert: 1,
  },
  {
    id: 'dark-ship',
    name: 'Dark Ship Events',
    description: 'Detection of AIS signal loss within the area',
    category: 'security',
    creditsPerAlert: 3,
  },
  {
    id: 'spoofing',
    name: 'Spoofing & GPS Manipulation',
    description: 'Identify vessels falsifying their location',
    category: 'security',
    creditsPerAlert: 3,
  },
  {
    id: 'sts-transfer',
    name: 'STS Transfers',
    description: 'Monitor ship-to-ship cargo exchanges',
    category: 'operations',
    creditsPerAlert: 3,
  },
  {
    id: 'port-call',
    name: 'Port of Call Activity',
    description: 'Detect vessels arriving or departing from ports',
    category: 'movement',
    creditsPerAlert: 2,
  },
  {
    id: 'vessel-distress',
    name: 'Vessel in Distress',
    description: 'Alert for emergency events within the area',
    category: 'security',
    creditsPerAlert: 5,
  },
  {
    id: 'ownership-change',
    name: 'Ownership & Registration Changes',
    description: 'Identify sudden flag or MMSI changes',
    category: 'compliance',
    creditsPerAlert: 3,
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment Updates',
    description: 'Automated alerts on vessel risk profile changes',
    category: 'compliance',
    creditsPerAlert: 2,
  },
  {
    id: 'area-risk',
    name: 'Area Risk Assessment',
    description: 'Overall area risk based on environmental factors',
    category: 'security',
    creditsPerAlert: 4,
  },
]

// Mock areas
interface MockArea {
  id: string
  name: string
  description?: string
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
  criteria: string[]
  updateFrequency: number
  status: string
  createdAt: string
  monitoring?: {
    isActive: boolean
    criteria: string[]
    updateFrequency: number
    lastUpdate: string
    alertsCount: number
  }
}

const mockAreas: MockArea[] = []

// Get monitoring criteria
router.get('/criteria', async (_req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  res.json({
    success: true,
    data: mockMonitoringCriteria,
    timestamp: new Date().toISOString(),
  })
})

// Calculate area monitoring cost
router.post('/calculate-cost', async (req, res) => {
  const { sizeKm2, criteria, updateFrequency, duration } = req.body

  await new Promise((resolve) => setTimeout(resolve, 200))

  // Convert duration in days to months
  const durationMonths = Math.ceil(duration / 30)
  
  // Calculate detailed cost
  const costDetails = calculateAreaMonitoringCostDetailed(
    sizeKm2,
    criteria.length,
    updateFrequency,
    durationMonths
  )

  res.json({
    success: true,
    data: costDetails,
    timestamp: new Date().toISOString(),
  })
})

// Get areas
router.get('/', async (_req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  res.json({
    success: true,
    data: mockAreas,
    total: mockAreas.length,
    timestamp: new Date().toISOString(),
  })
})

// Create area
router.post('/', async (req, res) => {
  const { name, description, geometry, criteria, updateFrequency } = req.body

  await new Promise((resolve) => setTimeout(resolve, 500))

  const newArea = {
    id: `area-${Date.now()}`,
    name,
    description,
    geometry,
    criteria,
    updateFrequency,
    status: 'active',
    createdAt: new Date().toISOString(),
    monitoring: {
      isActive: true,
      criteria,
      updateFrequency,
      lastUpdate: new Date().toISOString(),
      alertsCount: 0,
    },
  }

  mockAreas.push(newArea)

  res.json({
    success: true,
    data: newArea,
    timestamp: new Date().toISOString(),
  })
})

// Get area statistics
router.get('/statistics', async (_req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  res.json({
    success: true,
    data: {
      totalAreas: mockAreas.length,
      activeMonitoring: mockAreas.filter(a => a.monitoring?.isActive).length,
      totalAlerts: 0,
      creditsUsedToday: 0,
    },
    timestamp: new Date().toISOString(),
  })
})

export default router