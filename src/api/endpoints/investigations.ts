import { apiClient } from '../client'
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
    apiClient.get<Investigation[]>('/investigations', { params: filters }),

  // Get single investigation
  getInvestigation: (id: string) =>
    apiClient.get<Investigation>(`/investigations/${id}`),

  // Create new investigation
  createInvestigation: (data: InvestigationRequest) =>
    apiClient.post<Investigation>('/investigations', data),

  // Update investigation
  updateInvestigation: (id: string, data: Partial<Investigation>) =>
    apiClient.patch<Investigation>(`/investigations/${id}`, data),

  // Submit investigation for review
  submitInvestigation: (id: string) =>
    apiClient.post<Investigation>(`/investigations/${id}/submit`),

  // Cancel investigation
  cancelInvestigation: (id: string) =>
    apiClient.post<Investigation>(`/investigations/${id}/cancel`),

  // Schedule consultation
  scheduleConsultation: (id: string, date: string, notes: string) =>
    apiClient.post<Investigation>(`/investigations/${id}/consultation`, {
      date,
      notes,
    }),

  // Upload documents
  uploadDocuments: (id: string, formData: FormData) =>
    apiClient.post<InvestigationDocument[]>(
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
    apiClient.get<InvestigationStats>('/investigations/stats'),

  // Get cost estimate
  getEstimate: (data: InvestigationRequest) =>
    apiClient.post<{
      minCredits: number
      maxCredits: number
      factors: Array<{ name: string; credits: number }>
    }>('/investigations/estimate', data),
}
