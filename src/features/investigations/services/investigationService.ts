import { apiClient } from '@/api/client'
import {
  Investigation,
  InvestigationRequest,
  InvestigationFilters,
  InvestigationStats,
  InvestigationDocument,
} from '../types'

export const investigationService = {
  getInvestigations: async (
    filters?: InvestigationFilters,
  ): Promise<Investigation[]> => {
    const response = await apiClient.get('/investigations', { params: filters })
    return response.data
  },

  getInvestigation: async (id: string): Promise<Investigation> => {
    const response = await apiClient.get(`/investigations/${id}`)
    return response.data
  },

  createInvestigation: async (
    data: InvestigationRequest,
  ): Promise<Investigation> => {
    const response = await apiClient.post('/investigations', data)
    return response.data
  },

  updateInvestigation: async (
    id: string,
    data: Partial<Investigation>,
  ): Promise<Investigation> => {
    const response = await apiClient.patch(`/investigations/${id}`, data)
    return response.data
  },

  submitInvestigation: async (id: string): Promise<Investigation> => {
    const response = await apiClient.post(`/investigations/${id}/submit`)
    return response.data
  },

  cancelInvestigation: async (id: string): Promise<Investigation> => {
    const response = await apiClient.post(`/investigations/${id}/cancel`)
    return response.data
  },

  scheduleConsultation: async (
    investigationId: string,
    date: string,
    notes: string,
  ): Promise<Investigation> => {
    const response = await apiClient.post(
      `/investigations/${investigationId}/consultation`,
      { date, notes },
    )
    return response.data
  },

  uploadDocuments: async (
    investigationId: string,
    files: File[],
  ): Promise<InvestigationDocument[]> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('documents', file)
    })

    const response = await apiClient.post(
      `/investigations/${investigationId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    return response.data
  },

  deleteDocument: async (
    investigationId: string,
    documentId: string,
  ): Promise<void> => {
    await apiClient.delete(
      `/investigations/${investigationId}/documents/${documentId}`,
    )
  },

  downloadReport: async (reportId: string): Promise<Blob> => {
    const response = await apiClient.get(
      `/investigations/reports/${reportId}`,
      {
        responseType: 'blob',
      },
    )
    return response.data
  },

  getInvestigationStats: async (): Promise<InvestigationStats> => {
    const response = await apiClient.get('/investigations/stats')
    return response.data
  },

  getEstimatedCost: async (
    data: InvestigationRequest,
  ): Promise<{
    minCredits: number
    maxCredits: number
    factors: Array<{ name: string; credits: number }>
  }> => {
    const response = await apiClient.post('/investigations/estimate', data)
    return response.data
  },
}
