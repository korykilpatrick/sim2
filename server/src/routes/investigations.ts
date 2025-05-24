import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Mock data
interface MockInvestigation {
  id: string
  userId: string
  status: string
  title: string
  description: string
  scope: string
  priority: string
  progress: number
  createdAt: string
  updatedAt: string
  submittedAt?: string
  completedAt?: string
  updates: Array<{
    id: string
    timestamp: string
    message: string
    author: string
    type: string
  }>
  documents: Array<{
    id: string
    fileName: string
    fileSize: number
    mimeType: string
    uploadedAt: string
    uploadedBy: string
    category: string
  }>
  analystId?: string
  analystName?: string
  estimatedCompletion?: string
  estimatedCredits?: number
  finalCredits?: number
  consultation?: {
    scheduled: boolean
    date?: string
    notes?: string
  }
  [key: string]: unknown
}

const investigations: MockInvestigation[] = []
let investigationIdCounter = 1

// Get all investigations
router.get('/', authenticateToken, (req, res) => {
  const { status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query
  const userId = req.user?.userId

  let filtered = investigations.filter((inv) => inv.userId === userId)

  if (status && status !== 'all') {
    filtered = filtered.filter((inv) => inv.status === status)
  }

  if (search) {
    const searchLower = search.toString().toLowerCase()
    filtered = filtered.filter(
      (inv) =>
        inv.title.toLowerCase().includes(searchLower) ||
        inv.description.toLowerCase().includes(searchLower) ||
        inv.id.toString().includes(searchLower),
    )
  }

  // Sort
  filtered.sort((a, b) => {
    const sortField = sortBy as string
    const aVal = a[sortField]
    const bVal = b[sortField]
    const order = sortOrder === 'asc' ? 1 : -1

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * order
    }

    return (aVal as any) > (bVal as any) ? order : -order
  })

  res.json(filtered)
})

// Get single investigation
router.get('/:id', authenticateToken, (req, res) => {
  const investigation = investigations.find(
    (inv) => inv.id === req.params.id && inv.userId === req.user?.userId,
  )

  if (!investigation) {
    return res.status(404).json({ error: 'Investigation not found' })
  }

  res.json(investigation)
})

// Create investigation
router.post('/', authenticateToken, (req, res) => {
  const investigation = {
    id: `INV-${String(investigationIdCounter++).padStart(6, '0')}`,
    ...req.body,
    userId: req.user?.userId,
    status: 'draft',
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updates: [],
    documents: [],
  }

  investigations.push(investigation)
  res.status(201).json(investigation)
})

// Update investigation
router.patch('/:id', authenticateToken, (req, res) => {
  const index = investigations.findIndex(
    (inv) => inv.id === req.params.id && inv.userId === req.user?.userId,
  )

  if (index === -1) {
    return res.status(404).json({ error: 'Investigation not found' })
  }

  investigations[index] = {
    ...investigations[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  }

  res.json(investigations[index])
})

// Submit investigation
router.post('/:id/submit', authenticateToken, (req, res) => {
  const index = investigations.findIndex(
    (inv) => inv.id === req.params.id && inv.userId === req.user?.userId,
  )

  if (index === -1) {
    return res.status(404).json({ error: 'Investigation not found' })
  }

  investigations[index] = {
    ...investigations[index],
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updates: [
      ...investigations[index].updates,
      {
        id: `UPD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        message: 'Investigation submitted for review',
        author: 'System',
        type: 'status_change',
      },
    ],
  }

  // Simulate analyst assignment after a delay
  setTimeout(() => {
    const inv = investigations[index]
    if (inv && inv.status === 'submitted') {
      investigations[index] = {
        ...inv,
        status: 'under_review',
        analystId: 'ANALYST-001',
        analystName: 'Dr. Sarah Chen',
        estimatedCompletion: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        estimatedCredits: 8500,
        finalCredits: 8500,
        updates: [
          ...inv.updates,
          {
            id: `UPD-${Date.now()}`,
            timestamp: new Date().toISOString(),
            message: 'Investigation assigned to Dr. Sarah Chen for review',
            author: 'System',
            type: 'status_change',
          },
        ],
      }
    }
  }, 5000)

  res.json(investigations[index])
})

// Cancel investigation
router.post('/:id/cancel', authenticateToken, (req, res) => {
  const index = investigations.findIndex(
    (inv) => inv.id === req.params.id && inv.userId === req.user?.userId,
  )

  if (index === -1) {
    return res.status(404).json({ error: 'Investigation not found' })
  }

  investigations[index] = {
    ...investigations[index],
    status: 'cancelled',
    updatedAt: new Date().toISOString(),
    updates: [
      ...investigations[index].updates,
      {
        id: `UPD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        message: 'Investigation cancelled by user',
        author: 'System',
        type: 'status_change',
      },
    ],
  }

  res.json(investigations[index])
})

// Schedule consultation
router.post('/:id/consultation', authenticateToken, (req, res) => {
  const index = investigations.findIndex(
    (inv) => inv.id === req.params.id && inv.userId === req.user?.userId,
  )

  if (index === -1) {
    return res.status(404).json({ error: 'Investigation not found' })
  }

  const { date, notes } = req.body

  investigations[index] = {
    ...investigations[index],
    consultation: {
      scheduled: true,
      date,
      notes,
    },
    updatedAt: new Date().toISOString(),
    updates: [
      ...investigations[index].updates,
      {
        id: `UPD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        message: `Consultation scheduled for ${date}`,
        author: 'System',
        type: 'progress_update',
      },
    ],
  }

  res.json(investigations[index])
})

// Upload documents (mock)
router.post('/:id/documents', authenticateToken, (req, res) => {
  const index = investigations.findIndex(
    (inv) => inv.id === req.params.id && inv.userId === req.user?.userId,
  )

  if (index === -1) {
    return res.status(404).json({ error: 'Investigation not found' })
  }

  // Mock document upload response
  const mockDocuments = [
    {
      id: `DOC-${Date.now()}`,
      fileName: 'vessel-manifest.pdf',
      fileSize: 2048576,
      mimeType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'User',
      category: 'evidence',
    },
  ]

  investigations[index] = {
    ...investigations[index],
    documents: [...investigations[index].documents, ...mockDocuments],
    updatedAt: new Date().toISOString(),
  }

  res.json(mockDocuments)
})

// Delete document
router.delete('/:id/documents/:docId', authenticateToken, (req, res) => {
  const index = investigations.findIndex(
    (inv) => inv.id === req.params.id && inv.userId === req.user?.userId,
  )

  if (index === -1) {
    return res.status(404).json({ error: 'Investigation not found' })
  }

  investigations[index] = {
    ...investigations[index],
    documents: investigations[index].documents.filter(
      (doc) => doc.id !== req.params.docId,
    ),
    updatedAt: new Date().toISOString(),
  }

  res.status(204).send()
})

// Download report (mock)
router.get('/reports/:reportId', authenticateToken, (_req, res) => {
  // Mock PDF download
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="investigation-report.pdf"',
  )
  res.send(Buffer.from('Mock PDF content'))
})

// Get stats
router.get('/stats', authenticateToken, (req, res) => {
  const userInvestigations = investigations.filter(
    (inv) => inv.userId === req.user?.userId,
  )

  const stats = {
    total: userInvestigations.length,
    byStatus: {
      draft: userInvestigations.filter((inv) => inv.status === 'draft').length,
      submitted: userInvestigations.filter((inv) => inv.status === 'submitted')
        .length,
      under_review: userInvestigations.filter(
        (inv) => inv.status === 'under_review',
      ).length,
      in_progress: userInvestigations.filter(
        (inv) => inv.status === 'in_progress',
      ).length,
      completed: userInvestigations.filter((inv) => inv.status === 'completed')
        .length,
      cancelled: userInvestigations.filter((inv) => inv.status === 'cancelled')
        .length,
    },
    byScope: {
      vessel: userInvestigations.filter((inv) => inv.scope === 'vessel').length,
      area: userInvestigations.filter((inv) => inv.scope === 'area').length,
      event: userInvestigations.filter((inv) => inv.scope === 'event').length,
    },
    averageCompletionTime: 5.5,
    activeInvestigations: userInvestigations.filter((inv) =>
      ['submitted', 'under_review', 'in_progress'].includes(inv.status),
    ).length,
    completedThisMonth: userInvestigations.filter(
      (inv) =>
        inv.status === 'completed' &&
        inv.completedAt &&
        new Date(inv.completedAt).getMonth() === new Date().getMonth(),
    ).length,
  }

  res.json(stats)
})

// Get cost estimate
router.post('/estimate', authenticateToken, (req, res) => {
  const { scope, requestedSources, priority } = req.body

  // Base costs
  const baseCosts = {
    vessel: 5000,
    area: 7500,
    event: 10000,
  }

  // Count selected sources
  const sourceCount = Object.values(requestedSources || {}).filter(
    Boolean,
  ).length

  // Calculate multipliers
  const sourceMultiplier = 1 + (sourceCount - 1) * 0.2
  const priorityMultipliers = {
    standard: 1,
    urgent: 1.5,
    critical: 2,
  }

  const baseCost = baseCosts[scope as keyof typeof baseCosts] || 5000
  const minCredits =
    Math.round(
      (baseCost *
        sourceMultiplier *
        priorityMultipliers[priority as keyof typeof priorityMultipliers]) /
        100,
    ) * 100
  const maxCredits = Math.round(minCredits * 1.5)

  res.json({
    minCredits,
    maxCredits,
    factors: [
      { name: 'Base Investigation', credits: baseCost },
      {
        name: 'Intelligence Sources',
        credits: Math.round(baseCost * (sourceMultiplier - 1)),
      },
      {
        name: 'Priority Service',
        credits: Math.round(
          baseCost *
            (priorityMultipliers[priority as keyof typeof priorityMultipliers] -
              1),
        ),
      },
    ],
  })
})

export default router
