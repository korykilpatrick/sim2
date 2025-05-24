import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Mock chronology data generator
const generateChronologyData = (
  vesselId: string,
  timeRange?: { start: string; end: string },
) => {
  const startDate = timeRange?.start
    ? new Date(timeRange.start)
    : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const endDate = timeRange?.end ? new Date(timeRange.end) : new Date()

  // Generate random events between start and end dates
  const events = []
  const eventTypes = [
    'port_call',
    'sts_transfer',
    'dark_period',
    'bunkering',
    'inspection',
    'detention',
    'ownership_change',
    'flag_change',
    'risk_change',
  ]
  const riskLevels = ['low', 'medium', 'high', 'critical']

  // Generate 20-50 events
  const numEvents = Math.floor(Math.random() * 30) + 20

  for (let i = 0; i < numEvents; i++) {
    const eventDate = new Date(
      startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime()),
    )
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]

    const event: {
      id: string
      type: string
      timestamp: string
      riskLevel: string
      title: string
      location?: {
        lat: number
        lng: number
        name?: string
      }
      relatedVessel?: {
        name: string
        imo?: string
        mmsi?: string
      }
      duration?: number
      details?: Record<string, string | number>
    } = {
      id: `evt-${i + 1}`,
      type: eventType,
      timestamp: eventDate.toISOString(),
      riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
      title: '', // Will be set based on event type
    }

    // Add type-specific data
    switch (eventType) {
      case 'port_call': {
        const portName = [
          'Singapore',
          'Rotterdam',
          'Shanghai',
          'Houston',
          'Dubai',
        ][Math.floor(Math.random() * 5)]
        const portCoordinates: Record<string, [number, number]> = {
          Singapore: [1.3521, 103.8198],
          Rotterdam: [51.9225, 4.47917],
          Shanghai: [31.2304, 121.4737],
          Houston: [29.7604, -95.3698],
          Dubai: [25.2048, 55.2708],
        }
        const coords = portCoordinates[portName]
        event.title = `Port Call - ${portName}`
        event.location = {
          lat: coords[0],
          lng: coords[1],
          name: portName,
        }
        event.duration = Math.floor(Math.random() * 72 + 12)
        event.details = {
          portName,
          berthNumber: `B${Math.floor(Math.random() * 50 + 1)}`,
          purpose: ['Loading', 'Unloading', 'Bunkering', 'Crew Change'][
            Math.floor(Math.random() * 4)
          ],
        }
        break
      }

      case 'sts_transfer': {
        const vesselName = `MV ${['Atlas', 'Phoenix', 'Neptune', 'Orion', 'Titan'][Math.floor(Math.random() * 5)]}`
        const lat = Math.random() * 180 - 90
        const lng = Math.random() * 360 - 180
        event.title = `STS Transfer with ${vesselName}`
        event.location = {
          lat: parseFloat(lat.toFixed(4)),
          lng: parseFloat(lng.toFixed(4)),
          name: 'International Waters',
        }
        event.relatedVessel = {
          name: vesselName,
          imo: `IMO${Math.floor(Math.random() * 1000000 + 9000000)}`,
          mmsi: `${Math.floor(Math.random() * 100000000 + 200000000)}`,
        }
        event.duration = Math.floor(Math.random() * 8 + 2)
        event.details = {
          transferType: ['Cargo', 'Fuel', 'Supplies'][
            Math.floor(Math.random() * 3)
          ],
          quantity: Math.floor(Math.random() * 10000 + 1000),
        }
        event.riskLevel = Math.random() > 0.7 ? 'high' : 'medium'
        break
      }

      case 'dark_period': {
        const darkHours = Math.floor(Math.random() * 48 + 6)
        const lat = Math.random() * 60 - 30
        const lng = Math.random() * 100 + 40
        event.title = `AIS Dark Period - ${darkHours} hours`
        event.location = {
          lat: parseFloat(lat.toFixed(4)),
          lng: parseFloat(lng.toFixed(4)),
          name: 'Last Known Position',
        }
        event.duration = darkHours
        event.details = {
          lastKnownSpeed: Math.floor(Math.random() * 15 + 5),
          lastKnownCourse: Math.floor(Math.random() * 360),
          signalLostReason: 'Unknown',
        }
        event.riskLevel = darkHours > 24 ? 'critical' : 'high'
        break
      }

      case 'bunkering': {
        const bunkerLocation = ['Fujairah', 'Singapore', 'Gibraltar', 'Panama'][
          Math.floor(Math.random() * 4)
        ]
        const bunkerCoordinates: Record<string, [number, number]> = {
          Fujairah: [25.1288, 56.3264],
          Singapore: [1.2655, 103.8227],
          Gibraltar: [36.1408, -5.3536],
          Panama: [8.9936, -79.5197],
        }
        const coords = bunkerCoordinates[bunkerLocation]
        const fuelAmount = Math.floor(Math.random() * 500 + 100)
        const supplier = `${['Shell', 'BP', 'ExxonMobil', 'Total'][Math.floor(Math.random() * 4)]} Marine Fuels`
        event.title = `Bunkering - ${fuelAmount} MT`
        event.location = {
          lat: coords[0],
          lng: coords[1],
          name: bunkerLocation,
        }
        event.duration = Math.floor(Math.random() * 6 + 2)
        event.details = {
          fuelAmount,
          fuelType: ['HFO', 'MGO', 'VLSFO'][Math.floor(Math.random() * 3)],
          supplier,
        }
        break
      }

      case 'inspection': {
        const inspectionPort = ['Tokyo', 'Hamburg', 'New York', 'Sydney'][
          Math.floor(Math.random() * 4)
        ]
        const portCoordinates: Record<string, [number, number]> = {
          Tokyo: [35.6762, 139.6503],
          Hamburg: [53.5511, 9.9937],
          'New York': [40.7128, -74.006],
          Sydney: [-33.8688, 151.2093],
        }
        const coords = portCoordinates[inspectionPort]
        const result =
          Math.random() > 0.8 ? 'Deficiencies found' : 'No deficiencies'
        event.title = `PSC Inspection - ${inspectionPort}`
        event.location = {
          lat: coords[0],
          lng: coords[1],
          name: inspectionPort,
        }
        event.duration = Math.floor(Math.random() * 4 + 1)
        event.details = {
          authority: 'Port State Control',
          result,
          deficiencyCount:
            result === 'Deficiencies found'
              ? Math.floor(Math.random() * 5 + 1)
              : 0,
        }
        event.riskLevel = result === 'Deficiencies found' ? 'medium' : 'low'
        break
      }

      case 'detention': {
        const detentionPort = ['Lagos', 'Mumbai', 'Santos', 'Piraeus'][
          Math.floor(Math.random() * 4)
        ]
        const portCoordinates: Record<string, [number, number]> = {
          Lagos: [6.5244, 3.3792],
          Mumbai: [19.076, 72.8777],
          Santos: [-23.9608, -46.3336],
          Piraeus: [37.9415, 23.6474],
        }
        const coords = portCoordinates[detentionPort]
        const reason = [
          'Safety violations',
          'Documentation issues',
          'Crew certification',
        ][Math.floor(Math.random() * 3)]
        const days = Math.floor(Math.random() * 7 + 1)
        event.title = `Detention - ${detentionPort}`
        event.location = {
          lat: coords[0],
          lng: coords[1],
          name: detentionPort,
        }
        event.duration = days * 24 // Convert days to hours
        event.details = {
          reason,
          authority: 'Port Authority',
          fineAmount: Math.floor(Math.random() * 50000 + 10000),
        }
        event.riskLevel = 'critical'
        break
      }

      case 'ownership_change': {
        const ownerFrom = `${['Global', 'Pacific', 'Atlantic', 'Maritime'][Math.floor(Math.random() * 4)]} Shipping Ltd`
        const ownerTo = `${['Ocean', 'Sea', 'Marine', 'Naval'][Math.floor(Math.random() * 4)]} Transport Inc`
        event.title = 'Ownership Change'
        // No physical location for ownership change
        event.details = {
          previousOwner: ownerFrom,
          newOwner: ownerTo,
          registryPort: ['Panama City', 'Monrovia', 'Valletta'][
            Math.floor(Math.random() * 3)
          ],
        }
        event.riskLevel = 'medium'
        break
      }

      case 'flag_change': {
        const flags = [
          'Panama',
          'Liberia',
          'Marshall Islands',
          'Malta',
          'Cyprus',
          'Bahamas',
        ]
        const fromFlag = flags[Math.floor(Math.random() * flags.length)]
        let toFlag = flags[Math.floor(Math.random() * flags.length)]
        while (toFlag === fromFlag) {
          toFlag = flags[Math.floor(Math.random() * flags.length)]
        }
        event.title = `Flag Change - ${fromFlag} to ${toFlag}`
        // No physical location for flag change
        event.details = {
          previousFlag: fromFlag,
          newFlag: toFlag,
          registryNumber: `REG${Math.floor(Math.random() * 100000 + 10000)}`,
        }
        event.riskLevel = ['Malta', 'Cyprus'].includes(toFlag)
          ? 'low'
          : 'medium'
        break
      }

      case 'risk_change': {
        const previousLevel =
          riskLevels[Math.floor(Math.random() * riskLevels.length)]
        const factors = [
          'Sanctions list update',
          'Route analysis',
          'Behavioral pattern',
        ][Math.floor(Math.random() * 3)]
        event.title = `Risk Level Change - ${previousLevel} to ${event.riskLevel}`
        // No physical location for risk change
        event.details = {
          previousLevel,
          newLevel: event.riskLevel,
          triggerFactor: factors,
          assessmentScore: Math.floor(Math.random() * 100),
        }
        break
      }
    }

    events.push(event)
  }

  // Sort events by timestamp (newest first)
  events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  // Calculate summary statistics
  const summary = {
    totalEvents: events.length,
    portCalls: events.filter((e) => e.type === 'port_call').length,
    stsTransfers: events.filter((e) => e.type === 'sts_transfer').length,
    darkPeriods: events.filter((e) => e.type === 'dark_period').length,
    riskChanges: events.filter((e) => e.type === 'risk_change').length,
    highRiskEvents: events.filter(
      (e) => e.riskLevel === 'high' || e.riskLevel === 'critical',
    ).length,
    averageRiskScore: Math.floor(Math.random() * 30 + 40), // 40-70
  }

  return {
    vesselInfo: {
      vesselId,
      name: `Test Vessel ${vesselId}`,
      imo: `IMO${Math.floor(Math.random() * 1000000 + 9000000)}`,
      flag: 'Panama',
      type: 'Cargo',
      buildYear: 2015,
      grossTonnage: 25000,
      dwt: 35000,
    },
    timeRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      days: Math.floor(
        (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
      ),
    },
    summary,
    events,
    downloadFormats: ['pdf', 'excel', 'json'],
  }
}

// Mock compliance data generator
const generateComplianceData = (vesselId: string) => {
  const riskScore = Math.floor(Math.random() * 30) + 70 // 70-100 score

  return {
    vesselInfo: {
      vesselId,
      name: `Test Vessel ${vesselId}`,
      imo: `IMO${Math.floor(Math.random() * 1000000 + 9000000)}`,
      flag: 'Panama',
      type: 'Cargo',
      buildYear: 2015,
      grossTonnage: 25000,
      dwt: 35000,
    },
    sanctionsScreening: {
      status: Math.random() > 0.9 ? 'flagged' : 'clear',
      lastChecked: new Date().toISOString(),
      lists: [
        {
          name: 'OFAC',
          status: 'clear',
          lastChecked: new Date().toISOString(),
        },
        { name: 'EU', status: 'clear', lastChecked: new Date().toISOString() },
        { name: 'UN', status: 'clear', lastChecked: new Date().toISOString() },
      ],
      matches: [],
    },
    regulatoryCompliance: {
      imoCompliance: {
        status: 'compliant',
        certificateExpiry: new Date(
          Date.now() + 180 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        lastInspection: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      solasCompliance: {
        status: 'compliant',
        certificateExpiry: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        lastInspection: new Date(
          Date.now() - 60 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      marpolCompliance: {
        status: Math.random() > 0.8 ? 'non-compliant' : 'compliant',
        certificateExpiry: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        lastInspection: new Date(
          Date.now() - 45 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        issues: [],
      },
    },
    aisIntegrity: {
      spoofingDetected: false,
      gapPercentage: Math.random() * 5,
      lastSignal: new Date(
        Date.now() - Math.random() * 24 * 60 * 60 * 1000,
      ).toISOString(),
      flaggedIncidents: [],
    },
    ownership: {
      registeredOwner: 'Test Shipping Co.',
      beneficialOwner: 'Test Holdings Ltd.',
      manager: 'Test Management Inc.',
      lastUpdated: new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    operationalHistory: {
      totalPortCalls: Math.floor(Math.random() * 50 + 100),
      flaggedPorts: Math.floor(Math.random() * 3),
      averagePortStay: Math.random() * 2 + 1,
      tradingPatterns: ['Asia-Europe', 'Trans-Pacific'],
    },
    portStateControl: {
      inspections: Math.floor(Math.random() * 10 + 5),
      deficiencies: Math.floor(Math.random() * 5),
      detentions: Math.floor(Math.random() * 2),
      lastInspection: new Date(
        Date.now() - 60 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    riskAssessment: {
      overallScore: riskScore,
      category: riskScore >= 90 ? 'low' : riskScore >= 70 ? 'medium' : 'high',
      factors: [
        {
          name: 'Sanctions',
          score: Math.floor(Math.random() * 30 + 70),
          weight: 0.3,
        },
        {
          name: 'Regulatory',
          score: Math.floor(Math.random() * 30 + 70),
          weight: 0.25,
        },
        {
          name: 'AIS Integrity',
          score: Math.floor(Math.random() * 30 + 70),
          weight: 0.2,
        },
        {
          name: 'PSC History',
          score: Math.floor(Math.random() * 30 + 70),
          weight: 0.15,
        },
        {
          name: 'Ownership',
          score: Math.floor(Math.random() * 30 + 70),
          weight: 0.1,
        },
      ],
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reportVersion: '2.0',
    },
  }
}

// In-memory storage for reports (in production, use database)
const reports = new Map()

// Get report templates
router.get('/templates', authenticateToken, (_req: Request, res: Response) => {
  const templates = [
    {
      id: 'vessel-compliance-report',
      type: 'compliance' as const,
      name: 'Vessel Compliance Report',
      description:
        'Comprehensive compliance assessment including sanctions, regulations, and risk scoring',
      category: 'compliance',
      requiredFields: ['vesselId'],
      optionalFields: ['includeHistory', 'detailLevel'],
      estimatedTime: '< 1 minute',
      creditCost: 10,
      features: [
        'Sanctions screening (OFAC, EU, UN)',
        'Regulatory compliance (IMO, SOLAS, MARPOL)',
        'AIS integrity & spoofing detection',
        'Risk assessment scoring',
      ],
    },
    {
      id: 'vessel-chronology-report',
      type: 'chronology' as const,
      name: 'Vessel Chronology Report',
      description:
        'Complete historical timeline of vessel activities and events',
      category: 'history',
      requiredFields: ['vesselId', 'dateRange'],
      optionalFields: ['eventTypes', 'includePositions'],
      estimatedTime: '2-3 minutes',
      creditCost: 15,
      features: [
        'Port call history',
        'Ship-to-ship transfers',
        'Dark periods & AIS gaps',
        'Ownership & flag changes',
      ],
    },
    {
      id: 'fleet-compliance-summary',
      type: 'compliance' as const,
      name: 'Fleet Compliance Summary',
      description: 'Compliance overview for multiple vessels in a fleet',
      category: 'fleet',
      requiredFields: ['fleetId'],
      optionalFields: ['groupBy', 'includeDetails'],
      estimatedTime: '3-5 minutes',
      creditCost: 25,
      features: [
        'Fleet-wide compliance status',
        'Risk distribution analysis',
        'Regulatory compliance summary',
        'Batch report generation',
      ],
    },
  ]

  res.json({
    success: true,
    data: templates,
  })
})

// Generate a new report
router.post(
  '/generate',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { vesselId, reportType, options } = req.body

      if (!vesselId || !reportType) {
        return res.status(400).json({
          error: 'Missing required fields: vesselId and reportType',
        })
      }

      // Generate report ID
      const reportId = `REP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Create report based on type
      let reportData
      switch (reportType) {
        case 'compliance': {
          const complianceData = generateComplianceData(vesselId)
          reportData = {
            id: reportId,
            vesselId,
            vessel: {
              id: vesselId,
              name: complianceData.vesselInfo.name,
              imo: complianceData.vesselInfo.imo,
              flag: complianceData.vesselInfo.flag,
            },
            reportDate: new Date().toISOString(),
            status: 'completed',
            title: `Compliance Report - ${complianceData.vesselInfo.name}`,
            type: 'compliance',
            requestedBy: req.user?.userId || 'unknown',
            requestedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            credits: 10,
            ...complianceData,
            downloadFormats: ['pdf', 'excel', 'json'],
          }
          break
        }

        case 'chronology': {
          const chronologyData = generateChronologyData(
            vesselId,
            options?.timeRange,
          )

          // For demo purposes, complete immediately
          reportData = {
            id: reportId,
            vesselId,
            vessel: {
              id: vesselId,
              name: chronologyData.vesselInfo.name,
              imo: chronologyData.vesselInfo.imo,
              flag: chronologyData.vesselInfo.flag,
              type: chronologyData.vesselInfo.type,
            },
            generatedAt: new Date().toISOString(),
            status: 'completed',
            title: `Chronology Report - ${chronologyData.vesselInfo.name}`,
            type: 'chronology',
            requestedBy: req.user?.userId || 'unknown',
            requestedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            credits: 15, // VChR costs 15 credits according to product definition
            startDate: chronologyData.timeRange.start.split('T')[0],
            endDate: chronologyData.timeRange.end.split('T')[0],
            totalEvents: chronologyData.summary.totalEvents,
            ...chronologyData,
            downloadFormats: ['pdf', 'excel', 'json'],
          }
          break
        }

        default:
          return res.status(400).json({
            error: `Unsupported report type: ${reportType}`,
          })
      }

      // Store report
      reports.set(reportId, reportData)

      // Return report info in expected format
      res.status(201).json({
        success: true,
        data: {
          reportId: reportId,
          estimatedTime: reportData.status === 'completed' ? 0 : 180, // 3 minutes for processing reports
        },
      })
    } catch (error) {
      console.error('Report generation error:', error)
      res.status(500).json({
        error: 'Failed to generate report',
      })
    }
  },
)

// Get report by ID
router.get('/:id', authenticateToken, (req: Request, res: Response) => {
  const { id } = req.params
  const report = reports.get(id)

  if (!report) {
    return res.status(404).json({
      error: 'Report not found',
    })
  }

  // Check if user has access (in production, implement proper access control)
  if (report.requestedBy !== req.user?.userId && req.user?.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
    })
  }

  res.json(report)
})

// Download report
router.get(
  '/:id/download',
  authenticateToken,
  (req: Request, res: Response) => {
    const { id } = req.params
    const { format = 'pdf' } = req.query
    const report = reports.get(id)

    if (!report) {
      return res.status(404).json({
        error: 'Report not found',
      })
    }

    // Check if user has access
    if (report.requestedBy !== req.user?.userId && req.user?.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
      })
    }

    // Check if report is ready
    if (report.status !== 'completed') {
      return res.status(400).json({
        error: 'Report is not ready for download',
      })
    }

    // Generate content based on format
    let content: string | Buffer
    let contentType: string
    let filename: string

    switch (format) {
      case 'json':
        content = JSON.stringify(report, null, 2)
        contentType = 'application/json'
        filename = `report-${id}.json`
        break

      case 'excel': {
        // In production, use a library like xlsx to generate Excel files
        // For now, return CSV as a simple alternative
        let csvRows: string[][]

        if (report.type === 'chronology') {
          csvRows = [
            ['Vessel Chronology Report'],
            ['Report ID', report.id],
            ['Vessel', report.vessel.name],
            ['IMO', report.vessel.imo],
            ['Period', `${report.startDate} to ${report.endDate}`],
            ['Total Events', report.totalEvents?.toString() || '0'],
            [''],
            ['Event Timeline'],
            ['Timestamp', 'Type', 'Description', 'Location', 'Risk Level'],
          ]

          if (report.events && Array.isArray(report.events)) {
            report.events.forEach(
              (event: {
                timestamp: string
                type: string
                title: string
                location?: { lat: number; lng: number; name?: string }
                riskLevel?: string
              }) => {
                csvRows.push([
                  event.timestamp,
                  event.type,
                  event.title,
                  event.location?.name ||
                    `${event.location?.lat || ''}, ${event.location?.lng || ''}`,
                  event.riskLevel || '',
                ])
              },
            )
          }
        } else {
          csvRows = [
            ['Vessel Compliance Report'],
            ['Report ID', report.id],
            ['Vessel', report.vessel.name],
            ['IMO', report.vessel.imo],
            ['Generated', report.reportDate],
            [''],
            ['Risk Assessment'],
            ['Overall Score', report.riskAssessment?.overallScore || 'N/A'],
            ['Category', report.riskAssessment?.category || 'N/A'],
            [''],
            ['Sanctions Screening'],
            ['Status', report.sanctionsScreening?.status || 'N/A'],
            ['Last Checked', report.sanctionsScreening?.lastChecked || 'N/A'],
          ]
        }

        content = csvRows.map((row) => row.join(',')).join('\n')
        contentType = 'text/csv'
        filename = `report-${id}.csv`
        break
      }

      case 'pdf':
      default:
        // In production, use a library like pdfkit or puppeteer to generate PDFs
        // For now, return a mock PDF-like text document

        if (report.type === 'chronology') {
          let eventsList = ''
          if (report.events && Array.isArray(report.events)) {
            eventsList = report.events
              .map(
                (event: {
                  timestamp: string
                  type: string
                  title: string
                  location?: { lat: number; lng: number; name?: string }
                  relatedVessel?: { name: string; imo?: string; mmsi?: string }
                  duration?: number
                  riskLevel?: string
                  details?: Record<string, string | number>
                }) => {
                  let locationStr = 'N/A'
                  if (event.location) {
                    locationStr =
                      event.location.name ||
                      `${event.location.lat}, ${event.location.lng}`
                  }

                  let detailsStr = ''
                  if (event.details && Object.keys(event.details).length > 0) {
                    detailsStr =
                      '\nDetails: ' +
                      Object.entries(event.details)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')
                  }

                  let relatedVesselStr = ''
                  if (event.relatedVessel) {
                    relatedVesselStr = `\nRelated Vessel: ${event.relatedVessel.name} (${event.relatedVessel.imo || 'N/A'})`
                  }

                  let durationStr = ''
                  if (event.duration) {
                    durationStr = `\nDuration: ${event.duration} hours`
                  }

                  return `
${new Date(event.timestamp).toLocaleString()}
Type: ${event.type.replace(/_/g, ' ').toUpperCase()}
Title: ${event.title}
Location: ${locationStr}
Risk Level: ${event.riskLevel || 'N/A'}${relatedVesselStr}${durationStr}${detailsStr}
-------------------`
                },
              )
              .join('\n')
          }

          content = `
VESSEL CHRONOLOGY REPORT
========================

Report ID: ${report.id}
Generated: ${new Date(report.generatedAt || report.reportDate).toLocaleDateString()}

VESSEL INFORMATION
------------------
Name: ${report.vessel.name}
IMO: ${report.vessel.imo}
Flag: ${report.vessel.flag}
Type: ${report.vessel.type || 'N/A'}

REPORT PERIOD
-------------
From: ${report.startDate}
To: ${report.endDate}
Total Events: ${report.totalEvents || 0}

ACTIVITY SUMMARY
----------------
Port Calls: ${report.summary?.portCalls || 0}
STS Transfers: ${report.summary?.stsTransfers || 0}
Dark Periods: ${report.summary?.darkPeriods || 0}
Risk Changes: ${report.summary?.riskChanges || 0}
High Risk Events: ${report.summary?.highRiskEvents || 0}

EVENT TIMELINE
--------------
${eventsList}

This is a mock report for demonstration purposes.
          `
        } else {
          content = `
VESSEL COMPLIANCE REPORT
========================

Report ID: ${report.id}
Generated: ${new Date(report.reportDate).toLocaleDateString()}

VESSEL INFORMATION
------------------
Name: ${report.vessel.name}
IMO: ${report.vessel.imo}
Flag: ${report.vessel.flag}

RISK ASSESSMENT
---------------
Overall Score: ${report.riskAssessment?.overallScore || 'N/A'}/100
Risk Category: ${report.riskAssessment?.category || 'N/A'}

SANCTIONS SCREENING
-------------------
Status: ${report.sanctionsScreening?.status || 'N/A'}
Last Checked: ${report.sanctionsScreening?.lastChecked ? new Date(report.sanctionsScreening.lastChecked).toLocaleDateString() : 'N/A'}

REGULATORY COMPLIANCE
---------------------
IMO: ${report.regulatoryCompliance?.imoCompliance?.status || 'N/A'}
SOLAS: ${report.regulatoryCompliance?.solasCompliance?.status || 'N/A'}
MARPOL: ${report.regulatoryCompliance?.marpolCompliance?.status || 'N/A'}

This is a mock report for demonstration purposes.
          `
        }

        contentType = 'text/plain' // In production, use 'application/pdf'
        filename = `report-${id}.txt` // In production, use .pdf
        break
    }

    // Set headers for file download
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    // Send the content
    res.send(content)
  },
)

// Get user's reports
router.get('/', authenticateToken, (req: Request, res: Response) => {
  const { type, status, limit = 10, offset = 0 } = req.query
  const userId = req.user?.userId

  // Filter reports by user
  const userReports = Array.from(reports.values())
    .filter(
      (report) => report.requestedBy === userId || req.user?.role === 'admin',
    )
    .filter((report) => !type || report.type === type)
    .filter((report) => !status || report.status === status)
    .sort(
      (a, b) =>
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime(),
    )

  // Paginate results
  const paginatedReports = userReports.slice(
    Number(offset),
    Number(offset) + Number(limit),
  )

  res.json({
    reports: paginatedReports.map((report) => ({
      id: report.id,
      type: report.type,
      status: report.status,
      title: report.title,
      requestedAt: report.requestedAt,
      completedAt: report.completedAt,
    })),
    total: userReports.length,
    limit: Number(limit),
    offset: Number(offset),
  })
})

export default router
