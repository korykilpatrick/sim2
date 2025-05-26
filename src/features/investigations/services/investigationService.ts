import { investigationsApi } from '@/api/endpoints/investigations'
import {
  Investigation,
  InvestigationRequest,
  InvestigationFilters,
  InvestigationStats,
  InvestigationDocument,
} from '../types'

/**
 * Service for managing investigation operations
 * @module investigationService
 */
export const investigationService = {
  /**
   * Retrieves a list of investigations with optional filtering
   * @param {InvestigationFilters} [filters] - Optional filters
   * @param {string} [filters.status] - Filter by status (draft, submitted, in_progress, completed, cancelled)
   * @param {string} [filters.priority] - Filter by priority (low, medium, high, urgent)
   * @param {string} [filters.type] - Filter by investigation type
   * @param {string} [filters.dateFrom] - Filter by start date
   * @param {string} [filters.dateTo] - Filter by end date
   * @returns {Promise<Investigation[]>} Array of investigations
   * @throws {ApiError} If the request fails
   * @example
   * ```typescript
   * const investigations = await investigationService.getInvestigations({
   *   status: 'in_progress',
   *   priority: 'high'
   * })
   * ```
   */
  getInvestigations: async (
    filters?: InvestigationFilters,
  ): Promise<Investigation[]> => {
    const response = await investigationsApi.getInvestigations(filters)
    return response.data.data
  },

  /**
   * Retrieves a specific investigation by ID
   * @param {string} id - The investigation ID
   * @returns {Promise<Investigation>} The investigation details
   * @throws {ApiError} If the investigation is not found or request fails
   * @example
   * ```typescript
   * const investigation = await investigationService.getInvestigation('inv-123')
   * console.log(`Investigation: ${investigation.title} - ${investigation.status}`)
   * ```
   */
  getInvestigation: async (id: string): Promise<Investigation> => {
    const response = await investigationsApi.getInvestigation(id)
    return response.data.data
  },

  /**
   * Creates a new investigation request
   * @param {InvestigationRequest} data - Investigation request data
   * @param {string} data.vesselId - Vessel ID to investigate
   * @param {string} data.title - Investigation title
   * @param {string} data.description - Detailed description
   * @param {string} data.type - Investigation type (compliance, incident, background, other)
   * @param {string} data.priority - Priority level (low, medium, high, urgent)
   * @param {string[]} data.scope - Scope of investigation
   * @returns {Promise<Investigation>} The created investigation
   * @throws {ApiError} If validation fails or request fails
   * @example
   * ```typescript
   * const investigation = await investigationService.createInvestigation({
   *   vesselId: 'vessel-123',
   *   title: 'Compliance Check Q4 2024',
   *   description: 'Quarterly compliance verification',
   *   type: 'compliance',
   *   priority: 'medium',
   *   scope: ['registration', 'safety_equipment', 'crew_certifications']
   * })
   * ```
   */
  createInvestigation: async (
    data: InvestigationRequest,
  ): Promise<Investigation> => {
    const response = await investigationsApi.createInvestigation(data)
    return response.data.data
  },

  /**
   * Updates an existing investigation (draft status only)
   * @param {string} id - The investigation ID to update
   * @param {Partial<Investigation>} data - Partial investigation data to update
   * @returns {Promise<Investigation>} The updated investigation
   * @throws {ApiError} If the investigation is not found, not in draft status, or request fails
   * @example
   * ```typescript
   * const updated = await investigationService.updateInvestigation('inv-123', {
   *   title: 'Updated Title',
   *   priority: 'urgent',
   *   description: 'More detailed description'
   * })
   * ```
   */
  updateInvestigation: async (
    id: string,
    data: Partial<Investigation>,
  ): Promise<Investigation> => {
    const response = await investigationsApi.updateInvestigation(id, data)
    return response.data.data
  },

  /**
   * Submits a draft investigation for processing
   * @param {string} id - The investigation ID to submit
   * @returns {Promise<Investigation>} The submitted investigation with updated status
   * @throws {ApiError} If the investigation is not found, not in draft status, or insufficient credits
   * @example
   * ```typescript
   * const submitted = await investigationService.submitInvestigation('inv-123')
   * console.log(`Investigation submitted, new status: ${submitted.status}`)
   * ```
   */
  submitInvestigation: async (id: string): Promise<Investigation> => {
    const response = await investigationsApi.submitInvestigation(id)
    return response.data.data
  },

  /**
   * Cancels an active investigation
   * @param {string} id - The investigation ID to cancel
   * @returns {Promise<Investigation>} The cancelled investigation
   * @throws {ApiError} If the investigation is not found or cannot be cancelled
   * @example
   * ```typescript
   * const cancelled = await investigationService.cancelInvestigation('inv-123')
   * console.log('Investigation cancelled, credits refunded')
   * ```
   */
  cancelInvestigation: async (id: string): Promise<Investigation> => {
    const response = await investigationsApi.cancelInvestigation(id)
    return response.data.data
  },

  /**
   * Schedules an expert consultation for an investigation
   * @param {string} investigationId - The investigation ID
   * @param {string} date - Consultation date in ISO format
   * @param {string} notes - Additional notes for the expert
   * @returns {Promise<Investigation>} The updated investigation with consultation details
   * @throws {ApiError} If the investigation is not found or consultation cannot be scheduled
   * @example
   * ```typescript
   * const updated = await investigationService.scheduleConsultation(
   *   'inv-123',
   *   '2024-12-15T14:00:00Z',
   *   'Please focus on environmental compliance aspects'
   * )
   * ```
   */
  scheduleConsultation: async (
    investigationId: string,
    date: string,
    notes: string,
  ): Promise<Investigation> => {
    const response = await investigationsApi.scheduleConsultation(
      investigationId,
      date,
      notes,
    )
    return response.data.data
  },

  /**
   * Uploads supporting documents for an investigation
   * @param {string} investigationId - The investigation ID
   * @param {File[]} files - Array of files to upload
   * @returns {Promise<InvestigationDocument[]>} Array of uploaded document metadata
   * @throws {ApiError} If the investigation is not found or upload fails
   * @example
   * ```typescript
   * const fileInput = document.querySelector('input[type="file"]')
   * const files = Array.from(fileInput.files)
   * const documents = await investigationService.uploadDocuments('inv-123', files)
   * console.log(`Uploaded ${documents.length} documents`)
   * ```
   */
  uploadDocuments: async (
    investigationId: string,
    files: File[],
  ): Promise<InvestigationDocument[]> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('documents', file)
    })

    const response = await investigationsApi.uploadDocuments(
      investigationId,
      formData,
    )
    return response.data.data
  },

  /**
   * Deletes a document from an investigation
   * @param {string} investigationId - The investigation ID
   * @param {string} documentId - The document ID to delete
   * @returns {Promise<void>}
   * @throws {ApiError} If the investigation/document is not found or deletion fails
   * @example
   * ```typescript
   * await investigationService.deleteDocument('inv-123', 'doc-456')
   * console.log('Document deleted successfully')
   * ```
   */
  deleteDocument: async (
    investigationId: string,
    documentId: string,
  ): Promise<void> => {
    await investigationsApi.deleteDocument(investigationId, documentId)
  },

  /**
   * Downloads an investigation report as a PDF
   * @param {string} reportId - The report ID to download
   * @returns {Promise<Blob>} The report file as a Blob
   * @throws {ApiError} If the report is not found or download fails
   * @example
   * ```typescript
   * const blob = await investigationService.downloadReport('report-123')
   * const url = URL.createObjectURL(blob)
   * const a = document.createElement('a')
   * a.href = url
   * a.download = 'investigation-report.pdf'
   * a.click()
   * ```
   */
  downloadReport: async (reportId: string): Promise<Blob> => {
    const response = await investigationsApi.downloadReport(reportId)
    return response.data
  },

  /**
   * Retrieves investigation statistics for the current user
   * @returns {Promise<InvestigationStats>} Statistics including counts by status and priority
   * @throws {ApiError} If the request fails
   * @example
   * ```typescript
   * const stats = await investigationService.getInvestigationStats()
   * console.log(`Total investigations: ${stats.total}`)
   * console.log(`In progress: ${stats.byStatus.in_progress}`)
   * console.log(`High priority: ${stats.byPriority.high}`)
   * ```
   */
  getInvestigationStats: async (): Promise<InvestigationStats> => {
    const response = await investigationsApi.getInvestigationStats()
    return response.data.data
  },

  /**
   * Calculates estimated cost for an investigation
   * @param {InvestigationRequest} data - Investigation request data
   * @returns {Promise<{minCredits: number, maxCredits: number, factors: Array<{name: string, credits: number}>}>} Cost estimate breakdown
   * @throws {ApiError} If validation fails or request fails
   * @example
   * ```typescript
   * const estimate = await investigationService.getEstimatedCost({
   *   vesselId: 'vessel-123',
   *   type: 'compliance',
   *   scope: ['registration', 'safety_equipment'],
   *   priority: 'medium'
   * })
   * console.log(`Estimated cost: ${estimate.minCredits}-${estimate.maxCredits} credits`)
   * estimate.factors.forEach(f => {
   *   console.log(`${f.name}: ${f.credits} credits`)
   * })
   * ```
   */
  getEstimatedCost: async (
    data: InvestigationRequest,
  ): Promise<{
    minCredits: number
    maxCredits: number
    factors: Array<{ name: string; credits: number }>
  }> => {
    const response = await investigationsApi.getEstimate(data)
    return response.data.data
  },
}
