import { pdf } from '@react-pdf/renderer'
import { ComplianceReportTemplate } from '../templates/ComplianceReportTemplate'
import { ChronologyReportTemplate } from '../templates/ChronologyReportTemplate'
import type { ReportData } from '../templates/types'
import type { ComplianceReport, ChronologyReport } from '../types'

export type ReportType =
  | 'compliance'
  | 'chronology'
  | 'investigation'
  | 'custom'

interface GeneratePDFOptions {
  reportType: ReportType
  data: ReportData
  watermark?: boolean
}

/**
 * Generate a PDF report based on the report type and data
 */
export async function generatePDF({
  reportType,
  data,
  watermark = true,
}: GeneratePDFOptions): Promise<Blob> {
  let documentElement: React.ReactElement | null = null

  switch (reportType) {
    case 'compliance':
      documentElement = ComplianceReportTemplate({
        data,
        watermark,
      }) as React.ReactElement
      break
    case 'chronology':
      documentElement = ChronologyReportTemplate({
        data,
        watermark,
      }) as React.ReactElement
      break
    default:
      throw new Error(`Unsupported report type: ${reportType}`)
  }

  if (!documentElement) {
    throw new Error('Failed to generate document')
  }

  const blob = await pdf(documentElement).toBlob()

  return blob
}

/**
 * Generate and download a PDF report
 */
export async function downloadPDF(
  options: GeneratePDFOptions & { filename?: string },
) {
  const { filename = `report-${Date.now()}.pdf`, ...generateOptions } = options

  try {
    const blob = await generatePDF(generateOptions)

    // Create a download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return { success: true }
  } catch (error) {
    console.error('Failed to generate PDF:', error)
    return { success: false, error }
  }
}

/**
 * Convert report data from API to PDF template format
 */
export function convertToReportData(
  reportType: ReportType,
  apiData: ComplianceReport | ChronologyReport,
  userId: string,
): ReportData {
  const baseData: ReportData = {
    metadata: {
      reportId: apiData.id,
      title: 'Report',
      generatedAt: new Date(apiData.generatedAt || Date.now()),
      generatedBy: userId,
      reportType,
    },
    sections: [],
  }

  // Transform API data based on report type
  if (reportType === 'compliance' && 'riskAssessment' in apiData) {
    const complianceReport = apiData as ComplianceReport
    const extendedData = {
      ...baseData,
      metadata: {
        ...baseData.metadata,
        title: `Vessel Compliance Report - ${complianceReport.vessel.name}`,
        subtitle: `IMO: ${complianceReport.vessel.imo}`,
      },
      riskScore: complianceReport.riskAssessment.overallScore,
      complianceChecks: [
        {
          category: 'Sanctions Screening',
          status:
            complianceReport.sanctionsScreening.status === 'clear'
              ? 'passed'
              : complianceReport.sanctionsScreening.status === 'flagged'
                ? 'warning'
                : ('failed' as 'passed' | 'failed' | 'warning'),
          details: `${complianceReport.sanctionsScreening.matchedLists.length} matches found`,
        },
        {
          category: 'IMO Compliance',
          status: complianceReport.regulatoryCompliance.imoCompliant
            ? 'passed'
            : ('failed' as 'passed' | 'failed'),
          details: complianceReport.regulatoryCompliance.imoCompliant
            ? 'Vessel is IMO compliant'
            : 'IMO compliance issues detected',
        },
        {
          category: 'AIS Integrity',
          status: complianceReport.aisIntegrity.spoofingDetected
            ? 'failed'
            : ('passed' as 'passed' | 'failed'),
          details: `${complianceReport.aisIntegrity.darkPeriodsCount} dark periods, ${complianceReport.aisIntegrity.manipulationEvents} manipulation events`,
        },
      ],
      sanctions: complianceReport.sanctionsScreening.matchedLists.map(
        (list) => ({
          listName: list,
          matched: true,
        }),
      ),
      sections: [
        {
          title: 'Regulatory Compliance',
          content:
            complianceReport.regulatoryCompliance.issues.join(', ') ||
            'No issues found',
        },
        {
          title: 'Risk Factors',
          content: complianceReport.riskAssessment.factors
            .map((f) => `${f.category}: ${f.description}`)
            .join('\n'),
        },
      ],
    }

    // Return the extended data for compliance report template
    return {
      ...extendedData,
      disclaimer:
        'This compliance report is generated based on available data at the time of generation.',
    } as ReportData & {
      riskScore?: number
      complianceChecks?: any[]
      sanctions?: any[]
    }
  } else if (reportType === 'chronology' && 'events' in apiData) {
    const chronologyReport = apiData as ChronologyReport
    const extendedData = {
      ...baseData,
      metadata: {
        ...baseData.metadata,
        title: `Vessel Chronology Report - ${chronologyReport.vessel.name}`,
        subtitle: `Period: ${chronologyReport.timeRange.start} to ${chronologyReport.timeRange.end}`,
      },
      vesselInfo: chronologyReport.vessel,
      events: chronologyReport.events.map((e) => ({
        date: new Date(e.timestamp),
        type: e.type,
        description: e.description,
        location: e.location?.name,
        details: e.details,
      })),
      statistics: chronologyReport.summary,
      sections: [
        {
          title: 'Activity Summary',
          content: `Total Events: ${chronologyReport.summary.totalEvents}, Port Calls: ${chronologyReport.summary.portCalls}`,
        },
      ],
    }

    // Return the extended data for chronology report template
    return {
      ...extendedData,
      disclaimer:
        "This chronology report represents the vessel's known activities during the specified timeframe.",
    } as ReportData & { vesselInfo?: any; events?: any[]; statistics?: any }
  }

  return baseData
}
