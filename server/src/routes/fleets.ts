import { Router } from 'express'
import { mockData } from '../data/mockData'

const router = Router()

// Get all fleets
router.get('/', (req, res) => {
  res.json(mockData.fleets)
})

// Get fleet by ID
router.get('/:id', (req, res) => {
  const fleet = mockData.fleets.find((f) => f.id === req.params.id)

  if (!fleet) {
    return res.status(404).json({ error: 'Fleet not found' })
  }

  res.json(fleet)
})

// Get vessels in a fleet with full vessel data
router.get('/:id/vessels', (req, res) => {
  const fleet = mockData.fleets.find((f) => f.id === req.params.id)

  if (!fleet) {
    return res.status(404).json({ error: 'Fleet not found' })
  }

  // Get the fleet vessel associations
  const fleetVesselAssociations = mockData.fleetVessels.filter(
    (fv) => fv.fleetId === req.params.id,
  )

  // Map to full vessel data
  const vessels = fleetVesselAssociations
    .map((association) => {
      const vessel = mockData.vessels.find(
        (v) => v.imo === association.vesselImo,
      )
      if (!vessel) return null

      return {
        ...vessel,
        addedAt: association.addedAt,
        addedBy: association.addedBy,
      }
    })
    .filter(Boolean) // Remove any null values

  res.json(vessels)
})

// Add vessel to fleet
router.post('/:id/vessels', (req, res) => {
  const { vesselImo } = req.body
  const fleetId = req.params.id

  // Check if fleet exists
  const fleet = mockData.fleets.find((f) => f.id === fleetId)
  if (!fleet) {
    return res.status(404).json({ error: 'Fleet not found' })
  }

  // Check if vessel exists
  const vessel = mockData.vessels.find((v) => v.imo === vesselImo)
  if (!vessel) {
    return res.status(404).json({ error: 'Vessel not found' })
  }

  // Check if already in fleet
  const existing = mockData.fleetVessels.find(
    (fv) => fv.fleetId === fleetId && fv.vesselImo === vesselImo,
  )
  if (existing) {
    return res.status(400).json({ error: 'Vessel already in fleet' })
  }

  // Add to fleet
  const newAssociation = {
    fleetId,
    vesselImo,
    addedAt: new Date().toISOString(),
    addedBy: 'current-user',
  }

  mockData.fleetVessels.push(newAssociation)

  // Update fleet vessel count
  fleet.vesselCount = mockData.fleetVessels.filter(
    (fv) => fv.fleetId === fleetId,
  ).length

  res.status(201).json({
    ...vessel,
    addedAt: newAssociation.addedAt,
    addedBy: newAssociation.addedBy,
  })
})

// Remove vessel from fleet
router.delete('/:id/vessels/:vesselImo', (req, res) => {
  const { id: fleetId, vesselImo } = req.params

  const index = mockData.fleetVessels.findIndex(
    (fv) => fv.fleetId === fleetId && fv.vesselImo === vesselImo,
  )

  if (index === -1) {
    return res.status(404).json({ error: 'Vessel not found in fleet' })
  }

  mockData.fleetVessels.splice(index, 1)

  // Update fleet vessel count
  const fleet = mockData.fleets.find((f) => f.id === fleetId)
  if (fleet) {
    fleet.vesselCount = mockData.fleetVessels.filter(
      (fv) => fv.fleetId === fleetId,
    ).length
  }

  res.status(204).send()
})

// Create new fleet
router.post('/', (req, res) => {
  const { name, description, type } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Fleet name is required' })
  }

  const newFleet = {
    id: `fleet-${Date.now()}`,
    name,
    description: description || '',
    type: type || 'custom',
    vesselCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockData.fleets.push(newFleet)
  res.status(201).json(newFleet)
})

// Update fleet
router.put('/:id', (req, res) => {
  const fleet = mockData.fleets.find((f) => f.id === req.params.id)

  if (!fleet) {
    return res.status(404).json({ error: 'Fleet not found' })
  }

  const { name, description, type } = req.body

  if (name) fleet.name = name
  if (description !== undefined) fleet.description = description
  if (type) fleet.type = type
  fleet.updatedAt = new Date().toISOString()

  res.json(fleet)
})

// Delete fleet
router.delete('/:id', (req, res) => {
  const index = mockData.fleets.findIndex((f) => f.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ error: 'Fleet not found' })
  }

  // Remove all vessel associations
  mockData.fleetVessels = mockData.fleetVessels.filter(
    (fv) => fv.fleetId !== req.params.id,
  )

  // Remove fleet
  mockData.fleets.splice(index, 1)

  res.status(204).send()
})

export default router
