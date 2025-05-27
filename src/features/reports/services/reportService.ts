/**
 * Report service for generating and managing vessel intelligence reports
 * 
 * Provides functionality for creating compliance and chronology reports,
 * downloading reports in various formats, and managing report lifecycle.
 * Reports consume credits based on complexity and data range.
 * 
 * @module features/reports/services/reportService
 */

import { apiClient } from '@/api/client'
import type { ApiResponse, PaginatedResponse } from '@/api/types'
import type {
  ComplianceReport,
  ChronologyReport,
  ReportRequest,
  ReportFilters,
  ReportStatistics,
  ReportTemplate,
  BulkReportRequest,
} from '../types'
import { downloadPDF, convertToReportData } from './pdfGenerator'
import { useAuthStore } from '@/features/auth/services/authStore'

const BASE_URL = '/api/v1/reports'

/**
 * Report API service for vessel intelligence reports
 */
export const reportApi = {
  /**
   * Fetches a paginated list of reports with optional filtering
   * @param {ReportFilters} [filters] - Optional filters for searching and sorting reports
   * @returns {Promise<{items: Array<ComplianceReport | ChronologyReport>, meta: PaginationMeta}>} Paginated report list
   * @throws {Error} If the API request fails
   * @example
   * ```typescript
   * // Get all completed compliance reports
   * const reports = await reportApi.getReports({
   *   status: 'completed',
   *   reportType: 'compliance',
   *   sortBy: 'createdAt',
   *   sortOrder: 'desc'
   * })
   * ```
   */
  getReports: async (filters?: ReportFilters) => {
    const response = await apiClient.get<
      PaginatedResponse<ComplianceReport | ChronologyReport>
    >(BASE_URL, { params: filters })
    return {
      items: response.data.data,
      meta: response.data.meta,
    }
  },

  /**
   * Fetches a specific report by ID
   * @param {string} id - Report ID to fetch
   * @returns {Promise<ComplianceReport | ChronologyReport>} The report details
   * @throws {Error} If the report is not found or API request fails
   * @example
   * ```typescript
   * const report = await reportApi.getReport('rpt_123')
   * if ('riskAssessment' in report) {
   *   // Handle compliance report
   * } else {
   *   // Handle chronology report
   * }
   * ```
   */
  getReport: async (id: string) => {
    const response = await apiClient.get<
      ApiResponse<ComplianceReport | ChronologyReport>
    >(`${BASE_URL}/${id}`)
    return response.data.data
  },

  /**
   * Creates a new report generation request
   * @param {ReportRequest} request - Report generation parameters
   * @returns {Promise<{reportId: string, estimatedTime: number}>} Report ID and processing time estimate
   * @throws {Error} If insufficient credits or API request fails
   * @example
   * ```typescript
   * const { reportId, estimatedTime } = await reportApi.createReport({
   *   vesselId: 'vsl_123',
   *   reportType: 'compliance',
   *   options: {
   *     includeDetails: true,
   *     format: 'pdf'
   *   }
   * })
   * ```
   */
  createReport: async (request: ReportRequest) => {
    const response = await apiClient.post<
      ApiResponse<{ reportId: string; estimatedTime: number }>
    >(`${BASE_URL}/generate`, request)
    return response.data.data
  },

  /**
   * Creates multiple reports in a single batch operation
   * @param {BulkReportRequest} request - Bulk report generation parameters
   * @returns {Promise<{reportIds: string[], estimatedTime: number}>} Array of report IDs and total processing time
   * @throws {Error} If insufficient credits or API request fails
   * @example
   * ```typescript
   * const { reportIds } = await reportApi.createBulkReports({
   *   vesselIds: ['vsl_123', 'vsl_456', 'vsl_789'],
   *   reportType: 'chronology',
   *   options: {
   *     timeRange: {
   *       start: '2024-01-01',
   *       end: '2024-12-31'
   *     }
   *   }
   * })
   * ```
   */
  createBulkReports: async (request: BulkReportRequest) => {
    const response = await apiClient.post<
      ApiResponse<{ reportIds: string[]; estimatedTime: number }>
    >(`${BASE_URL}/bulk`, request)
    return response.data.data
  },

  /**
   * Downloads a report in the specified format
   * @param {string} id - Report ID to download
   * @param {'pdf' | 'excel' | 'json'} format - Desired download format
   * @returns {Promise<Blob>} Report file as a blob
   * @throws {Error} If the report is not ready or API request fails
   * @example
   * ```typescript
   * const blob = await reportApi.downloadReport('rpt_123', 'pdf')
   * const url = URL.createObjectURL(blob)
   * const a = document.createElement('a')
   * a.href = url
   * a.download = 'compliance-report.pdf'
   * a.click()
   * ```
   */
  downloadReport: async (id: string, format: 'pdf' | 'excel' | 'json') => {
    // For PDF format, generate client-side using react-pdf
    if (format === 'pdf') {
      try {
        // First get the report data
        const report = await reportApi.getReport(id)
        const user = useAuthStore.getState().user

        // Determine report type
        const reportType =
          'riskAssessment' in report ? 'compliance' : 'chronology'

        // Convert to PDF format
        const reportData = convertToReportData(
          reportType,
          report,
          user?.email || 'Unknown',
        )

        // Generate and download PDF
        const result = await downloadPDF({
          reportType,
          data: reportData,
          filename: `${reportType}-report-${id}.pdf`,
        })

        if (!result.success) {
          throw new Error('Failed to generate PDF')
        }

        return new Blob(['PDF generated successfully'], { type: 'text/plain' })
      } catch (error) {
        console.error('PDF generation failed:', error)
        // Fallback to server-side generation
      }
    }

    // For other formats, use server endpoint
    const response = await apiClient.get(`${BASE_URL}/${id}/download`, {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Fetches available report templates with credit costs
   * @returns {Promise<ReportTemplate[]>} Array of available report templates
   * @throws {Error} If the API request fails
   * @example
   * ```typescript
   * const templates = await reportApi.getReportTemplates()
   * templates.forEach(template => {
   *   console.log(`${template.name}: ${template.baseCredits} credits`)
   * })
   * ```
   */
  getReportTemplates: async () => {
    const response = await apiClient.get<ApiResponse<ReportTemplate[]>>(
      `${BASE_URL}/templates`,
    )
    return response.data.data
  },

  /**
   * Fetches aggregated report generation statistics
   * @returns {Promise<ReportStatistics>} Report usage and performance statistics
   * @throws {Error} If the API request fails
   * @example
   * ```typescript
   * const stats = await reportApi.getReportStatistics()
   * console.log(`Total reports: ${stats.totalReports}`)
   * console.log(`Average processing time: ${stats.averageProcessingTime}s`)
   * ```
   */
  getReportStatistics: async () => {
    const response = await apiClient.get<ApiResponse<ReportStatistics>>(
      `${BASE_URL}/statistics`,
    )
    return response.data.data
  },

  /**
   * Checks the current status of a report generation job
   * @param {string} id - Report ID to check status for
   * @returns {Promise<{status: string, progress: number, estimatedTimeRemaining?: number}>} Report processing status
   * @throws {Error} If the report ID is invalid or API request fails
   * @example
   * ```typescript
   * const status = await reportApi.getReportStatus('rpt_123')
   * if (status.status === 'processing') {
   *   console.log(`Progress: ${status.progress}%`)
   * }
   * ```
   */
  getReportStatus: async (id: string) => {
    const response = await apiClient.get<
      ApiResponse<{
        status: 'pending' | 'processing' | 'completed' | 'failed'
        progress: number
        estimatedTimeRemaining?: number
      }>
    >(`${BASE_URL}/${id}/status`)
    return response.data.data
  },

  /**
   * Cancels a pending or processing report
   * @param {string} id - Report ID to cancel
   * @returns {Promise<void>}
   * @throws {Error} If the report cannot be cancelled or API request fails
   * @example
   * ```typescript
   * await reportApi.cancelReport('rpt_123')
   * // Credits are refunded if report was not yet processed
   * ```
   */
  cancelReport: async (id: string) => {
    const response = await apiClient.post<ApiResponse<void>>(
      `${BASE_URL}/${id}/cancel`,
    )
    return response.data.data
  },

  /**
   * Retries generation of a failed report
   * @param {string} id - Report ID to retry
   * @returns {Promise<void>}
   * @throws {Error} If the report cannot be retried or API request fails
   * @example
   * ```typescript
   * await reportApi.retryReport('rpt_123')
   * // No additional credits charged for retry
   * ```
   */
  retryReport: async (id: string) => {
    const response = await apiClient.post<ApiResponse<void>>(
      `${BASE_URL}/${id}/retry`,
    )
    return response.data.data
  },

  /**
   * Fetches a compliance report with full details
   * @param {string} id - Compliance report ID
   * @returns {Promise<ComplianceReport>} Complete compliance report data
   * @throws {Error} If the report is not found or API request fails
   * @example
   * ```typescript
   * const report = await reportApi.getComplianceReport('rpt_123')
   * console.log(`Risk score: ${report.riskAssessment.overallScore}`)
   * ```
   */
  getComplianceReport: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ComplianceReport>>(
      `${BASE_URL}/compliance/${id}`,
    )
    return response.data.data
  },

  /**
   * Fetches a chronology report with full event history
   * @param {string} id - Chronology report ID
   * @returns {Promise<ChronologyReport>} Complete chronology report data
   * @throws {Error} If the report is not found or API request fails
   * @example
   * ```typescript
   * const report = await reportApi.getChronologyReport('rpt_456')
   * console.log(`Total events: ${report.summary.totalEvents}`)
   * ```
   */
  getChronologyReport: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ChronologyReport>>(
      `${BASE_URL}/chronology/${id}`,
    )
    return response.data.data
  },

  /**
   * Previews the credit cost for a report before generation
   * @param {ReportRequest} request - Report parameters to estimate cost for
   * @returns {Promise<{credits: number, processingTime: string}>} Cost estimate and time
   * @throws {Error} If the parameters are invalid or API request fails
   * @example
   * ```typescript
   * const cost = await reportApi.previewReportCost({
   *   vesselId: 'vsl_123',
   *   reportType: 'compliance'
   * })
   * console.log(`Will cost ${cost.credits} credits`)
   * ```
   */
  previewReportCost: async (request: ReportRequest) => {
    const response = await apiClient.post<
      ApiResponse<{ credits: number; processingTime: string }>
    >(`${BASE_URL}/preview-cost`, request)
    return response.data.data
  },

  /**
   * Fetches all reports for a specific vessel
   * @param {string} vesselId - Vessel ID to get reports for
   * @returns {Promise<Array<ComplianceReport | ChronologyReport>>} Array of vessel reports
   * @throws {Error} If the vessel ID is invalid or API request fails
   * @example
   * ```typescript
   * const reports = await reportApi.getVesselReports('vsl_123')
   * const recentCompliance = reports.find(r => 
   *   'riskAssessment' in r && r.status === 'completed'
   * )
   * ```
   */
  getVesselReports: async (vesselId: string) => {
    const response = await apiClient.get<
      ApiResponse<Array<ComplianceReport | ChronologyReport>>
    >(`${BASE_URL}/vessel/${vesselId}`)
    return response.data.data
  },
}
