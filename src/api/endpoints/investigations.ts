import { apiClient } from '../client'
import type { ApiResponse, PaginatedResponse } from '../types'
import type {
  Investigation,
  InvestigationRequest,
  InvestigationFilters,
  InvestigationStats,
  InvestigationDocument,
} from '@/features/investigations/types'

export const investigationsApi = {
  // Get list of investigations
  getInvestigations: (filters?: InvestigationFilters) =>
    apiClient.get<PaginatedResponse<Investigation>>('/investigations', {
      params: filters,
    }),

  // Get single investigation
  getInvestigation: (id: string) =>
    apiClient.get<ApiResponse<Investigation>>(`/investigations/${id}`),

  // Create new investigation
  createInvestigation: (data: InvestigationRequest) =>
    apiClient.post<ApiResponse<Investigation>>('/investigations', data),

  // Update investigation
  updateInvestigation: (id: string, data: Partial<Investigation>) =>
    apiClient.patch<ApiResponse<Investigation>>(`/investigations/${id}`, data),

  // Submit investigation for review
  submitInvestigation: (id: string) =>
    apiClient.post<ApiResponse<Investigation>>(`/investigations/${id}/submit`),

  // Cancel investigation
  cancelInvestigation: (id: string) =>
    apiClient.post<ApiResponse<Investigation>>(`/investigations/${id}/cancel`),

  // Schedule consultation
  scheduleConsultation: (id: string, date: string, notes: string) =>
    apiClient.post<ApiResponse<Investigation>>(
      `/investigations/${id}/consultation`,
      {
        date,
        notes,
      },
    ),

  // Upload documents
  uploadDocuments: (id: string, formData: FormData) =>
    apiClient.post<ApiResponse<InvestigationDocument[]>>(
      `/investigations/${id}/documents`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    ),

  // Delete document
  deleteDocument: (investigationId: string, documentId: string) =>
    apiClient.delete(
      `/investigations/${investigationId}/documents/${documentId}`,
    ),

  // Download report
  downloadReport: (reportId: string) =>
    apiClient.get(`/investigations/reports/${reportId}`, {
      responseType: 'blob',
    }),

  // Get investigation stats
  getInvestigationStats: () =>
    apiClient.get<ApiResponse<InvestigationStats>>('/investigations/stats'),

  // Get cost estimate
  getEstimate: (data: InvestigationRequest) =>
    apiClient.post<
      ApiResponse<{
        minCredits: number
        maxCredits: number
        factors: Array<{ name: string; credits: number }>
      }>
    >('/investigations/estimate', data),
}
