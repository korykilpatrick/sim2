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

const BASE_URL = '/api/v1/reports'

export const reportApi = {
  // Get reports
  getReports: async (filters?: ReportFilters) => {
    const response = await apiClient.get<
      PaginatedResponse<ComplianceReport | ChronologyReport>
    >(BASE_URL, { params: filters })
    return {
      items: response.data.data,
      meta: response.data.meta,
    }
  },

  // Get specific report
  getReport: async (id: string) => {
    const response = await apiClient.get<
      ApiResponse<ComplianceReport | ChronologyReport>
    >(`${BASE_URL}/${id}`)
    return response.data.data
  },

  // Create report
  createReport: async (request: ReportRequest) => {
    const response = await apiClient.post<
      ApiResponse<{ reportId: string; estimatedTime: number }>
    >(`${BASE_URL}/generate`, request)
    return response.data.data
  },

  // Create bulk reports
  createBulkReports: async (request: BulkReportRequest) => {
    const response = await apiClient.post<
      ApiResponse<{ reportIds: string[]; estimatedTime: number }>
    >(`${BASE_URL}/bulk`, request)
    return response.data.data
  },

  // Download report
  downloadReport: async (id: string, format: 'pdf' | 'excel' | 'json') => {
    const response = await apiClient.get(`${BASE_URL}/${id}/download`, {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  },

  // Get report templates
  getReportTemplates: async () => {
    const response = await apiClient.get<ApiResponse<ReportTemplate[]>>(
      `${BASE_URL}/templates`,
    )
    return response.data.data
  },

  // Get report statistics
  getReportStatistics: async () => {
    const response = await apiClient.get<ApiResponse<ReportStatistics>>(
      `${BASE_URL}/statistics`,
    )
    return response.data.data
  },

  // Get report status
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

  // Cancel report
  cancelReport: async (id: string) => {
    const response = await apiClient.post<ApiResponse<void>>(
      `${BASE_URL}/${id}/cancel`,
    )
    return response.data.data
  },

  // Retry failed report
  retryReport: async (id: string) => {
    const response = await apiClient.post<ApiResponse<void>>(
      `${BASE_URL}/${id}/retry`,
    )
    return response.data.data
  },

  // Get compliance report details
  getComplianceReport: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ComplianceReport>>(
      `${BASE_URL}/compliance/${id}`,
    )
    return response.data.data
  },

  // Get chronology report details
  getChronologyReport: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ChronologyReport>>(
      `${BASE_URL}/chronology/${id}`,
    )
    return response.data.data
  },

  // Preview report cost
  previewReportCost: async (request: ReportRequest) => {
    const response = await apiClient.post<
      ApiResponse<{ credits: number; processingTime: string }>
    >(`${BASE_URL}/preview-cost`, request)
    return response.data.data
  },

  // Get recent vessel reports
  getVesselReports: async (vesselId: string) => {
    const response = await apiClient.get<
      ApiResponse<Array<ComplianceReport | ChronologyReport>>
    >(`${BASE_URL}/vessel/${vesselId}`)
    return response.data.data
  },
}
