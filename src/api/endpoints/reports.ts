/**
 * Report generation API endpoints
 */

import { apiClient } from '../client'
import type { ApiResponse, PaginatedResponse } from '../types'
import type { Report } from '@/features/reports/types'

export const reportsApi = {
  /**
   * Get all reports for the current user
   */
  getAll: (params?: {
    page?: number
    limit?: number
    status?: 'pending' | 'processing' | 'completed' | 'failed'
    type?: string
  }) => apiClient.get<PaginatedResponse<Report>>('/reports', { params }),

  /**
   * Get report by ID
   */
  getById: (id: string) => apiClient.get<ApiResponse<Report>>(`/reports/${id}`),

  /**
   * Generate a new report
   */
  generate: (data: {
    type: 'compliance' | 'chronology' | 'investigation'
    vesselIds: string[]
    startDate: string
    endDate: string
    options?: Record<string, unknown>
  }) =>
    apiClient.post<ApiResponse<{ reportId: string; estimatedTime: number }>>(
      '/reports/generate',
      data,
    ),

  /**
   * Get report status
   */
  getStatus: (id: string) =>
    apiClient.get<
      ApiResponse<{
        status: 'pending' | 'processing' | 'completed' | 'failed'
        progress: number
        error?: string
      }>
    >(`/reports/${id}/status`),

  /**
   * Download report
   */
  download: (id: string, format: 'pdf' | 'excel' | 'csv') =>
    apiClient.get(`/reports/${id}/download`, {
      params: { format },
      responseType: 'blob',
    }),

  /**
   * Get report templates
   */
  getTemplates: (type?: 'compliance' | 'chronology' | 'investigation') =>
    apiClient.get<
      ApiResponse<
        Array<{
          id: string
          name: string
          description: string
          type: string
          fields: Record<string, unknown>
        }>
      >
    >('/reports/templates', { params: { type } }),

  /**
   * Schedule recurring report
   */
  schedule: (data: {
    templateId: string
    schedule: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
    options?: Record<string, unknown>
  }) =>
    apiClient.post<ApiResponse<{ scheduleId: string }>>(
      '/reports/schedule',
      data,
    ),

  /**
   * Get scheduled reports
   */
  getScheduled: () =>
    apiClient.get<
      ApiResponse<
        Array<{
          id: string
          templateId: string
          schedule: string
          nextRun: string
          recipients: string[]
          active: boolean
        }>
      >
    >('/reports/scheduled'),

  /**
   * Cancel scheduled report
   */
  cancelSchedule: (scheduleId: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(
      `/reports/scheduled/${scheduleId}`,
    ),
}
