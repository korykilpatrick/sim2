/**
 * Report generation API endpoints
 * Provides compliance, chronology, and investigation report generation and scheduling
 * @module api/endpoints/reports
 */

import { apiClient } from '../client'
import type { ApiResponse, PaginatedResponse } from '../types'
import type { Report } from '@/features/reports/types'

/**
 * Reports API client for generating and managing maritime intelligence reports
 */
export const reportsApi = {
  /**
   * Get paginated list of reports for the current user
   * @param {Object} [params] - Filter and pagination parameters
   * @param {number} [params.page=1] - Page number (1-based)
   * @param {number} [params.limit=20] - Results per page (max 50)
   * @param {'pending'|'processing'|'completed'|'failed'} [params.status] - Filter by report status
   * @param {string} [params.type] - Filter by report type
   * @returns {Promise<PaginatedResponse<Report>>} Paginated report list
   * @throws {ApiError} 401 - Not authenticated
   * @example
   * ```typescript
   * const response = await reportsApi.getAll({
   *   status: 'completed',
   *   type: 'compliance',
   *   page: 1,
   *   limit: 10
   * })
   * const { data: reports, pagination } = response.data
   * console.log(`Found ${pagination.total} reports`)
   * reports.forEach(report => {
   *   console.log(`${report.name} - ${report.status}`)
   * })
   * ```
   */
  getAll: (params?: {
    page?: number
    limit?: number
    status?: 'pending' | 'processing' | 'completed' | 'failed'
    type?: string
  }) => apiClient.get<PaginatedResponse<Report>>('/reports', { params }),

  /**
   * Get detailed report information
   * @param {string} id - Report UUID
   * @returns {Promise<ApiResponse<Report>>} Complete report details
   * @throws {ApiError} 404 - Report not found
   * @throws {ApiError} 403 - Not authorized to view this report
   * @example
   * ```typescript
   * const response = await reportsApi.getById(reportId)
   * const report = response.data.data
   * console.log(`Report: ${report.name}`)
   * console.log(`Status: ${report.status}`)
   * console.log(`Generated: ${new Date(report.createdAt).toLocaleDateString()}`)
   * if (report.status === 'completed') {
   *   console.log('Ready for download')
   * }
   * ```
   */
  getById: (id: string) => apiClient.get<ApiResponse<Report>>(`/reports/${id}`),

  /**
   * Generate a new report (asynchronous process)
   * @param {Object} data - Report generation parameters
   * @param {'compliance'|'chronology'|'investigation'} data.type - Report type
   * @param {string[]} data.vesselIds - Vessel UUIDs to include (max 50)
   * @param {string} data.startDate - Report period start (ISO 8601)
   * @param {string} data.endDate - Report period end (ISO 8601)
   * @param {Record<string, unknown>} [data.options] - Type-specific options
   * @returns {Promise<ApiResponse<Object>>} Report ID and estimated completion time
   * @throws {ApiError} 400 - Invalid parameters or date range
   * @throws {ApiError} 402 - Insufficient credits
   * @throws {ApiError} 404 - One or more vessels not found
   * @example
   * ```typescript
   * const response = await reportsApi.generate({
   *   type: 'compliance',
   *   vesselIds: ['vessel-1', 'vessel-2'],
   *   startDate: '2024-01-01T00:00:00Z',
   *   endDate: '2024-01-31T23:59:59Z',
   *   options: {
   *     includeSanctions: true,
   *     includeDarkActivity: true,
   *     includePortCalls: true
   *   }
   * })
   * const { reportId, estimatedTime } = response.data.data
   * console.log(`Report ${reportId} will be ready in ~${estimatedTime} minutes`)
   * ```
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
   * Check report generation status
   * @param {string} id - Report UUID
   * @returns {Promise<ApiResponse<Object>>} Current status and progress
   * @throws {ApiError} 404 - Report not found
   * @example
   * ```typescript
   * const response = await reportsApi.getStatus(reportId)
   * const { status, progress, error } = response.data.data
   * 
   * switch (status) {
   *   case 'pending':
   *     console.log('Report queued for processing')
   *     break
   *   case 'processing':
   *     console.log(`Progress: ${progress}%`)
   *     break
   *   case 'completed':
   *     console.log('Report ready for download!')
   *     break
   *   case 'failed':
   *     console.error(`Report failed: ${error}`)
   *     break
   * }
   * ```
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
   * Download generated report in specified format
   * @param {string} id - Report UUID
   * @param {'pdf'|'excel'|'csv'} format - Download format
   * @returns {Promise<Blob>} Report file as blob
   * @throws {ApiError} 404 - Report not found
   * @throws {ApiError} 400 - Report not completed or format not supported
   * @throws {ApiError} 403 - Not authorized to download this report
   * @example
   * ```typescript
   * const response = await reportsApi.download(reportId, 'pdf')
   * const blob = response.data
   * 
   * // Create download link
   * const url = window.URL.createObjectURL(blob)
   * const a = document.createElement('a')
   * a.href = url
   * a.download = `compliance-report-${reportId}.pdf`
   * a.click()
   * window.URL.revokeObjectURL(url)
   * ```
   */
  download: (id: string, format: 'pdf' | 'excel' | 'csv') =>
    apiClient.get(`/reports/${id}/download`, {
      params: { format },
      responseType: 'blob',
    }),

  /**
   * Get available report templates
   * @param {'compliance'|'chronology'|'investigation'} [type] - Filter by template type
   * @returns {Promise<ApiResponse<Array>>} List of available templates
   * @throws {ApiError} 401 - Not authenticated
   * @example
   * ```typescript
   * const response = await reportsApi.getTemplates('compliance')
   * const templates = response.data.data
   * 
   * console.log('Available compliance templates:')
   * templates.forEach(template => {
   *   console.log(`- ${template.name}: ${template.description}`)
   *   console.log(`  Fields: ${Object.keys(template.fields).join(', ')}`)
   * })
   * ```
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
   * Schedule recurring report generation
   * @param {Object} data - Schedule configuration
   * @param {string} data.templateId - Report template UUID
   * @param {'daily'|'weekly'|'monthly'} data.schedule - Recurrence frequency
   * @param {string[]} data.recipients - Email addresses for delivery
   * @param {Record<string, unknown>} [data.options] - Template-specific options
   * @returns {Promise<ApiResponse<{scheduleId: string}>>} Created schedule ID
   * @throws {ApiError} 400 - Invalid schedule configuration
   * @throws {ApiError} 404 - Template not found
   * @throws {ApiError} 402 - Insufficient credits for recurring reports
   * @example
   * ```typescript
   * const response = await reportsApi.schedule({
   *   templateId: 'compliance-weekly-template',
   *   schedule: 'weekly',
   *   recipients: ['compliance@company.com', 'ops@company.com'],
   *   options: {
   *     fleetId: 'fleet-123',
   *     includeSummary: true
   *   }
   * })
   * const { scheduleId } = response.data.data
   * console.log(`Scheduled report ${scheduleId} will run weekly`)
   * ```
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
   * Get all scheduled reports for the current user
   * @returns {Promise<ApiResponse<Array>>} List of scheduled reports
   * @throws {ApiError} 401 - Not authenticated
   * @example
   * ```typescript
   * const response = await reportsApi.getScheduled()
   * const schedules = response.data.data
   * 
   * console.log('Active scheduled reports:')
   * schedules.filter(s => s.active).forEach(schedule => {
   *   console.log(`- ${schedule.schedule} report to ${schedule.recipients.join(', ')}`)
   *   console.log(`  Next run: ${new Date(schedule.nextRun).toLocaleDateString()}`)
   * })
   * ```
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
   * Cancel a scheduled report
   * @param {string} scheduleId - Schedule UUID to cancel
   * @returns {Promise<ApiResponse<{message: string}>>} Success message
   * @throws {ApiError} 404 - Schedule not found
   * @throws {ApiError} 403 - Not authorized to cancel this schedule
   * @example
   * ```typescript
   * await reportsApi.cancelSchedule(scheduleId)
   * console.log('Scheduled report cancelled')
   * ```
   */
  cancelSchedule: (scheduleId: string) =>
    apiClient.delete<ApiResponse<{ message: string }>>(
      `/reports/scheduled/${scheduleId}`,
    ),
}
