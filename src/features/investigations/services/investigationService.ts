import { investigationsApi } from '@/api/endpoints/investigations'
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
    const response = await investigationsApi.getInvestigations(filters)
    return response.data.data
  },

  getInvestigation: async (id: string): Promise<Investigation> => {
    const response = await investigationsApi.getInvestigation(id)
    return response.data.data
  },

  createInvestigation: async (
    data: InvestigationRequest,
  ): Promise<Investigation> => {
    const response = await investigationsApi.createInvestigation(data)
    return response.data.data
  },

  updateInvestigation: async (
    id: string,
    data: Partial<Investigation>,
  ): Promise<Investigation> => {
    const response = await investigationsApi.updateInvestigation(id, data)
    return response.data.data
  },

  submitInvestigation: async (id: string): Promise<Investigation> => {
    const response = await investigationsApi.submitInvestigation(id)
    return response.data.data
  },

  cancelInvestigation: async (id: string): Promise<Investigation> => {
    const response = await investigationsApi.cancelInvestigation(id)
    return response.data.data
  },

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

  deleteDocument: async (
    investigationId: string,
    documentId: string,
  ): Promise<void> => {
    await investigationsApi.deleteDocument(investigationId, documentId)
  },

  downloadReport: async (reportId: string): Promise<Blob> => {
    const response = await investigationsApi.downloadReport(reportId)
    return response.data
  },

  getInvestigationStats: async (): Promise<InvestigationStats> => {
    const response = await investigationsApi.getInvestigationStats()
    return response.data.data
  },

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
