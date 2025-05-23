import { apiClient } from '@/lib/api/client'
import type {
  ComplianceReport,
  ChronologyReport,
  ReportRequest,
  ReportFilters,
  ReportStatistics,
  ReportTemplate,
  BulkReportRequest,
} from '../types'

const BASE_URL = '/api/v1/reports'

export const reportApi = {
  // Get reports
  getReports: async (filters?: ReportFilters) => {
    return apiClient.get<{
      data: Array<ComplianceReport | ChronologyReport>
      total: number
    }>(BASE_URL, { params: filters })
  },

  // Get specific report
  getReport: async (id: string) => {
    return apiClient.get<{ data: ComplianceReport | ChronologyReport }>(
      `${BASE_URL}/${id}`,
    )
  },

  // Create report
  createReport: async (request: ReportRequest) => {
    return apiClient.post<{ data: { reportId: string; estimatedTime: number } }>(
      BASE_URL,
      request,
    )
  },

  // Create bulk reports
  createBulkReports: async (request: BulkReportRequest) => {
    return apiClient.post<{
      data: { reportIds: string[]; estimatedTime: number }
    }>(`${BASE_URL}/bulk`, request)
  },

  // Download report
  downloadReport: async (id: string, format: 'pdf' | 'excel' | 'json') => {
    return apiClient.get(`${BASE_URL}/${id}/download`, {
      params: { format },
      responseType: 'blob',
    })
  },

  // Get report templates
  getReportTemplates: async () => {
    return apiClient.get<{ data: ReportTemplate[] }>(`${BASE_URL}/templates`)
  },

  // Get report statistics
  getReportStatistics: async () => {
    return apiClient.get<{ data: ReportStatistics }>(`${BASE_URL}/statistics`)
  },

  // Get report status
  getReportStatus: async (id: string) => {
    return apiClient.get<{
      data: {
        status: 'pending' | 'processing' | 'completed' | 'failed'
        progress: number
        estimatedTimeRemaining?: number
      }
    }>(`${BASE_URL}/${id}/status`)
  },

  // Cancel report
  cancelReport: async (id: string) => {
    return apiClient.post(`${BASE_URL}/${id}/cancel`)
  },

  // Retry failed report
  retryReport: async (id: string) => {
    return apiClient.post(`${BASE_URL}/${id}/retry`)
  },

  // Get compliance report details
  getComplianceReport: async (id: string) => {
    return apiClient.get<{ data: ComplianceReport }>(
      `${BASE_URL}/compliance/${id}`,
    )
  },

  // Get chronology report details
  getChronologyReport: async (id: string) => {
    return apiClient.get<{ data: ChronologyReport }>(
      `${BASE_URL}/chronology/${id}`,
    )
  },

  // Preview report cost
  previewReportCost: async (request: ReportRequest) => {
    return apiClient.post<{
      data: { credits: number; processingTime: string }
    }>(`${BASE_URL}/preview-cost`, request)
  },

  // Get recent vessel reports
  getVesselReports: async (vesselId: string) => {
    return apiClient.get<{
      data: Array<ComplianceReport | ChronologyReport>
    }>(`${BASE_URL}/vessel/${vesselId}`)
  },
}