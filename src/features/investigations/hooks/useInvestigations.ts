import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { investigationService } from '../services/investigationService'
import {
  Investigation,
  InvestigationRequest,
  InvestigationFilters,
} from '../types'

export function useInvestigations(filters?: InvestigationFilters) {
  return useQuery({
    queryKey: ['investigations', filters],
    queryFn: () => investigationService.getInvestigations(filters),
  })
}

export function useInvestigation(id: string) {
  return useQuery({
    queryKey: ['investigation', id],
    queryFn: () => investigationService.getInvestigation(id),
    enabled: !!id,
  })
}

export function useCreateInvestigation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InvestigationRequest) =>
      investigationService.createInvestigation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investigations'] })
    },
  })
}

export function useUpdateInvestigation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Investigation> }) =>
      investigationService.updateInvestigation(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['investigation', id] })
      queryClient.invalidateQueries({ queryKey: ['investigations'] })
    },
  })
}

export function useScheduleConsultation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      investigationId,
      date,
      notes,
    }: {
      investigationId: string
      date: string
      notes: string
    }) =>
      investigationService.scheduleConsultation(investigationId, date, notes),
    onSuccess: (_, { investigationId }) => {
      queryClient.invalidateQueries({
        queryKey: ['investigation', investigationId],
      })
    },
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      investigationId,
      files,
    }: {
      investigationId: string
      files: File[]
    }) => investigationService.uploadDocuments(investigationId, files),
    onSuccess: (_, { investigationId }) => {
      queryClient.invalidateQueries({
        queryKey: ['investigation', investigationId],
      })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      investigationId,
      documentId,
    }: {
      investigationId: string
      documentId: string
    }) => investigationService.deleteDocument(investigationId, documentId),
    onSuccess: (_, { investigationId }) => {
      queryClient.invalidateQueries({
        queryKey: ['investigation', investigationId],
      })
    },
  })
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: (reportId: string) =>
      investigationService.downloadReport(reportId),
  })
}
