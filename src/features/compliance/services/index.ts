import { apiClient } from '@/api/client'
import type { ComplianceReport, ReportRequest, ReportFilter } from '../types'

export const complianceService = {
  // Generate a new report
  generateReport: async (request: ReportRequest): Promise<ComplianceReport> => {
    const response = await apiClient.post('/api/reports/generate', request)
    return response.data
  },

  // Get a specific report by ID
  getReport: async (reportId: string): Promise<ComplianceReport> => {
    const response = await apiClient.get(`/api/reports/${reportId}`)
    return response.data
  },

  // List reports with optional filters
  listReports: async (
    filters?: ReportFilter,
  ): Promise<{
    reports: ComplianceReport[]
    total: number
    page: number
    pageSize: number
  }> => {
    const response = await apiClient.get('/api/reports', { params: filters })
    return response.data
  },

  // Download report as PDF
  downloadReport: async (reportId: string): Promise<Blob> => {
    const response = await apiClient.get(`/api/reports/${reportId}/download`, {
      responseType: 'blob',
    })
    return response.data
  },

  // Get report generation status
  getReportStatus: async (
    reportId: string,
  ): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress?: number
    message?: string
  }> => {
    const response = await apiClient.get(`/api/reports/${reportId}/status`)
    return response.data
  },

  // Cancel a pending report
  cancelReport: async (reportId: string): Promise<void> => {
    await apiClient.post(`/api/reports/${reportId}/cancel`)
  },

  // Get report pricing
  getReportPricing: async (): Promise<{
    compliance: number
    chronology: number
  }> => {
    const response = await apiClient.get('/api/reports/pricing')
    return response.data
  },

  // Preview report (limited data)
  previewReport: async (
    request: ReportRequest,
  ): Promise<{
    estimatedCredits: number
    dataAvailability: {
      sanctions: boolean
      regulatory: boolean
      ais: boolean
      ownership: boolean
    }
    lastReportDate?: string
  }> => {
    const response = await apiClient.post('/api/reports/preview', request)
    return response.data
  },
}
