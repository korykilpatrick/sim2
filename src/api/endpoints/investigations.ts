/**
 * Investigation API endpoints
 * Manages special investigations, document analysis, and expert consultations
 * @module api/endpoints/investigations
 */

import { apiClient } from '../client'
import type { ApiResponse, PaginatedResponse } from '../types'
import type {
  Investigation,
  InvestigationRequest,
  InvestigationFilters,
  InvestigationStats,
  InvestigationDocument,
} from '@/features/investigations/types'

/**
 * Investigation API client for special investigation services
 */
export const investigationsApi = {
  /**
   * Get paginated list of investigations with optional filters
   * @param {InvestigationFilters} [filters] - Optional filter parameters
   * @param {string} [filters.status] - Filter by status (draft, submitted, in_progress, completed, cancelled)
   * @param {string} [filters.type] - Filter by investigation type
   * @param {string} [filters.priority] - Filter by priority (low, medium, high, urgent)
   * @param {string} [filters.startDate] - Filter by creation date (ISO 8601)
   * @param {string} [filters.endDate] - Filter by creation date (ISO 8601)
   * @param {number} [filters.page] - Page number (1-based)
   * @param {number} [filters.limit] - Results per page (max 50)
   * @returns {Promise<PaginatedResponse<Investigation>>} Paginated investigation list
   * @throws {ApiError} 401 - Not authenticated
   * @example
   * ```typescript
   * const response = await investigationsApi.getInvestigations({
   *   status: 'in_progress',
   *   priority: 'high',
   *   page: 1,
   *   limit: 20
   * })
   * const { data: investigations, pagination } = response.data
   * console.log(`Showing ${investigations.length} of ${pagination.total} investigations`)
   * ```
   */
  getInvestigations: (filters?: InvestigationFilters) =>
    apiClient.get<PaginatedResponse<Investigation>>('/investigations', {
      params: filters,
    }),

  /**
   * Get detailed information for a specific investigation
   * @param {string} id - Investigation UUID
   * @returns {Promise<ApiResponse<Investigation>>} Complete investigation details
   * @throws {ApiError} 404 - Investigation not found
   * @throws {ApiError} 403 - Not authorized to view this investigation
   * @example
   * ```typescript
   * const response = await investigationsApi.getInvestigation(investigationId)
   * const investigation = response.data.data
   * console.log(`Investigation: ${investigation.title}`)
   * console.log(`Status: ${investigation.status}`)
   * console.log(`Progress: ${investigation.progress}%`)
   * ```
   */
  getInvestigation: (id: string) =>
    apiClient.get<ApiResponse<Investigation>>(`/investigations/${id}`),

  /**
   * Create a new investigation request
   * @param {InvestigationRequest} data - Investigation request data
   * @param {string} data.vesselId - Vessel UUID to investigate
   * @param {string} data.type - Investigation type (sanctions, compliance, ownership, etc.)
   * @param {string} data.scope - Investigation scope (basic, standard, comprehensive)
   * @param {string} data.priority - Priority level (low, medium, high, urgent)
   * @param {string} data.description - Detailed description of investigation needs
   * @param {string[]} [data.sources] - Specific data sources to include
   * @param {boolean} [data.expertConsultation] - Include expert consultation
   * @returns {Promise<ApiResponse<Investigation>>} Created investigation
   * @throws {ApiError} 400 - Invalid request data
   * @throws {ApiError} 402 - Insufficient credits
   * @throws {ApiError} 404 - Vessel not found
   * @example
   * ```typescript
   * const response = await investigationsApi.createInvestigation({
   *   vesselId: 'vessel-123',
   *   type: 'sanctions',
   *   scope: 'comprehensive',
   *   priority: 'high',
   *   description: 'Need full sanctions screening due to suspicious activity',
   *   sources: ['ofac', 'un', 'eu'],
   *   expertConsultation: true
   * })
   * const investigation = response.data.data
   * console.log(`Created investigation ${investigation.id}`)
   * console.log(`Estimated cost: ${investigation.estimatedCredits} credits`)
   * ```
   */
  createInvestigation: (data: InvestigationRequest) =>
    apiClient.post<ApiResponse<Investigation>>('/investigations', data),

  /**
   * Update investigation details (draft status only)
   * @param {string} id - Investigation UUID
   * @param {Partial<Investigation>} data - Fields to update
   * @returns {Promise<ApiResponse<Investigation>>} Updated investigation
   * @throws {ApiError} 400 - Invalid update data
   * @throws {ApiError} 404 - Investigation not found
   * @throws {ApiError} 403 - Cannot update non-draft investigation
   * @example
   * ```typescript
   * // Update priority and add notes
   * const response = await investigationsApi.updateInvestigation(investigationId, {
   *   priority: 'urgent',
   *   description: 'Updated: Time-sensitive due to upcoming port call'
   * })
   * ```
   */
  updateInvestigation: (id: string, data: Partial<Investigation>) =>
    apiClient.patch<ApiResponse<Investigation>>(`/investigations/${id}`, data),

  /**
   * Submit investigation for processing (charges credits)
   * @param {string} id - Investigation UUID
   * @returns {Promise<ApiResponse<Investigation>>} Submitted investigation
   * @throws {ApiError} 400 - Investigation not in draft status
   * @throws {ApiError} 402 - Insufficient credits
   * @throws {ApiError} 404 - Investigation not found
   * @example
   * ```typescript
   * try {
   *   const response = await investigationsApi.submitInvestigation(investigationId)
   *   const investigation = response.data.data
   *   console.log(`Investigation submitted, ${investigation.estimatedCredits} credits charged`)
   *   console.log('Estimated completion:', investigation.estimatedCompletionDate)
   * } catch (error) {
   *   if (error.response?.status === 402) {
   *     console.error('Insufficient credits')
   *   }
   * }
   * ```
   */
  submitInvestigation: (id: string) =>
    apiClient.post<ApiResponse<Investigation>>(`/investigations/${id}/submit`),

  /**
   * Cancel an investigation (refund if not started)
   * @param {string} id - Investigation UUID
   * @returns {Promise<ApiResponse<Investigation>>} Cancelled investigation
   * @throws {ApiError} 400 - Cannot cancel completed investigation
   * @throws {ApiError} 404 - Investigation not found
   * @example
   * ```typescript
   * const response = await investigationsApi.cancelInvestigation(investigationId)
   * const investigation = response.data.data
   * if (investigation.refundedCredits > 0) {
   *   console.log(`Refunded ${investigation.refundedCredits} credits`)
   * }
   * ```
   */
  cancelInvestigation: (id: string) =>
    apiClient.post<ApiResponse<Investigation>>(`/investigations/${id}/cancel`),

  /**
   * Schedule expert consultation for the investigation
   * @param {string} id - Investigation UUID
   * @param {string} date - Consultation date/time (ISO 8601)
   * @param {string} notes - Notes for the expert
   * @returns {Promise<ApiResponse<Investigation>>} Updated investigation with consultation
   * @throws {ApiError} 400 - Invalid date or investigation doesn't include consultation
   * @throws {ApiError} 404 - Investigation not found
   * @throws {ApiError} 409 - Consultation already scheduled
   * @example
   * ```typescript
   * const response = await investigationsApi.scheduleConsultation(
   *   investigationId,
   *   '2024-02-15T14:00:00Z',
   *   'Please focus on ownership structure and beneficial ownership'
   * )
   * console.log('Consultation scheduled for', response.data.data.consultation.scheduledDate)
   * ```
   */
  scheduleConsultation: (id: string, date: string, notes: string) =>
    apiClient.post<ApiResponse<Investigation>>(
      `/investigations/${id}/consultation`,
      {
        date,
        notes,
      },
    ),

  /**
   * Upload supporting documents for the investigation
   * @param {string} id - Investigation UUID
   * @param {FormData} formData - Form data with files (max 10MB each, PDF/DOC/DOCX/JPG/PNG)
   * @returns {Promise<ApiResponse<InvestigationDocument[]>>} Uploaded document metadata
   * @throws {ApiError} 400 - Invalid file type or size
   * @throws {ApiError} 404 - Investigation not found
   * @throws {ApiError} 413 - File too large
   * @example
   * ```typescript
   * const formData = new FormData()
   * formData.append('documents', file1)
   * formData.append('documents', file2)
   * 
   * const response = await investigationsApi.uploadDocuments(investigationId, formData)
   * const documents = response.data.data
   * console.log(`Uploaded ${documents.length} documents`)
   * documents.forEach(doc => {
   *   console.log(`- ${doc.name} (${doc.size} bytes)`)
   * })
   * ```
   */
  uploadDocuments: (id: string, formData: FormData) =>
    apiClient.post<ApiResponse<InvestigationDocument[]>>(
      `/investigations/${id}/documents`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    ),

  /**
   * Delete a document from the investigation
   * @param {string} investigationId - Investigation UUID
   * @param {string} documentId - Document UUID
   * @returns {Promise<void>} No response data
   * @throws {ApiError} 404 - Investigation or document not found
   * @throws {ApiError} 403 - Cannot delete from submitted investigation
   * @example
   * ```typescript
   * await investigationsApi.deleteDocument(investigationId, documentId)
   * console.log('Document deleted')
   * ```
   */
  deleteDocument: (investigationId: string, documentId: string) =>
    apiClient.delete(
      `/investigations/${investigationId}/documents/${documentId}`,
    ),

  /**
   * Download investigation report (PDF)
   * @param {string} reportId - Report UUID from completed investigation
   * @returns {Promise<Blob>} Report file as blob
   * @throws {ApiError} 404 - Report not found
   * @throws {ApiError} 403 - Not authorized to download this report
   * @example
   * ```typescript
   * const response = await investigationsApi.downloadReport(reportId)
   * const blob = response.data
   * 
   * // Create download link
   * const url = window.URL.createObjectURL(blob)
   * const a = document.createElement('a')
   * a.href = url
   * a.download = `investigation-report-${reportId}.pdf`
   * a.click()
   * window.URL.revokeObjectURL(url)
   * ```
   */
  downloadReport: (reportId: string) =>
    apiClient.get(`/investigations/reports/${reportId}`, {
      responseType: 'blob',
    }),

  /**
   * Get investigation statistics for the current user
   * @returns {Promise<ApiResponse<InvestigationStats>>} User's investigation statistics
   * @throws {ApiError} 401 - Not authenticated
   * @example
   * ```typescript
   * const response = await investigationsApi.getInvestigationStats()
   * const stats = response.data.data
   * console.log(`Total investigations: ${stats.total}`)
   * console.log(`In progress: ${stats.inProgress}`)
   * console.log(`Completed: ${stats.completed}`)
   * console.log(`Average completion time: ${stats.averageCompletionDays} days`)
   * ```
   */
  getInvestigationStats: () =>
    apiClient.get<ApiResponse<InvestigationStats>>('/investigations/stats'),

  /**
   * Get cost estimate for an investigation
   * @param {InvestigationRequest} data - Investigation parameters
   * @returns {Promise<ApiResponse<Object>>} Cost breakdown and estimates
   * @throws {ApiError} 400 - Invalid estimation parameters
   * @example
   * ```typescript
   * const response = await investigationsApi.getEstimate({
   *   vesselId: 'vessel-123',
   *   type: 'ownership',
   *   scope: 'comprehensive',
   *   sources: ['corporate', 'beneficial_ownership'],
   *   expertConsultation: true
   * })
   * const estimate = response.data.data
   * console.log(`Estimated cost: ${estimate.minCredits}-${estimate.maxCredits} credits`)
   * console.log('Cost breakdown:')
   * estimate.factors.forEach(factor => {
   *   console.log(`- ${factor.name}: ${factor.credits} credits`)
   * })
   * ```
   */
  getEstimate: (data: InvestigationRequest) =>
    apiClient.post<
      ApiResponse<{
        minCredits: number
        maxCredits: number
        factors: Array<{ name: string; credits: number }>
      }>
    >('/investigations/estimate', data),
}
