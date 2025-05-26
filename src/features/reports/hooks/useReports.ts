import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportApi } from '../services/reportService'
import type { ReportFilters, ReportRequest, BulkReportRequest } from '../types'
import { useCreditDeduction } from '@/features/shared/hooks'
import { creditService } from '@/features/shared/services'
import { useToast } from '@/hooks/useToast'
import { useNavigate } from 'react-router-dom'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/api/types'
import { reportKeys } from './'

export function useReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: () => reportApi.getReports(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useReport(id: string) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportApi.getReport(id),
    enabled: !!id,
  })
}

export function useReportById(id: string) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportApi.getReport(id),
    enabled: !!id,
  })
}

export function useCreateReport() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { deductCredits } = useCreditDeduction()

  return useMutation({
    mutationFn: async (request: ReportRequest) => {
      // Calculate credit cost based on report type
      const creditCost = creditService.calculateServiceCost(
        request.reportType === 'compliance'
          ? 'compliance_report'
          : 'chronology_report',
        {},
      )

      // Check if user has sufficient credits
      const hasSufficientCredits =
        await creditService.checkSufficientCredits(creditCost)
      if (!hasSufficientCredits) {
        throw new Error(
          `Insufficient credits. This report requires ${creditCost} credits.`,
        )
      }

      // First deduct credits
      await deductCredits(
        creditCost,
        `${request.reportType === 'compliance' ? 'Compliance' : 'Chronology'} report`,
      )

      // Then create the report
      return reportApi.createReport(request)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      queryClient.invalidateQueries({ queryKey: reportKeys.statistics() })
      showToast({ type: 'success', message: 'Report generation started' })
      navigate(`/reports/${response.reportId}`)
    },
    onError: (error: AxiosError<ApiResponse>) => {
      showToast({
        type: 'error',
        message:
          error.response?.data?.error?.message ||
          error.message ||
          'Failed to create report',
      })
    },
  })
}

export function useCreateBulkReports() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (request: BulkReportRequest) =>
      reportApi.createBulkReports(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      queryClient.invalidateQueries({ queryKey: reportKeys.statistics() })
      showToast({ type: 'success', message: 'Bulk report generation started' })
    },
    onError: (error: AxiosError<ApiResponse>) => {
      showToast({
        type: 'error',
        message:
          error.response?.data?.error?.message ||
          'Failed to create bulk reports',
      })
    },
  })
}

export function useDownloadReport() {
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({
      reportId,
      format,
    }: {
      reportId: string
      format: 'pdf' | 'excel' | 'json'
    }) => reportApi.downloadReport(reportId, format),
    onSuccess: (response, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        `report-${variables.reportId}.${variables.format}`,
      )
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showToast({ type: 'success', message: 'Report downloaded successfully' })
    },
    onError: (error: AxiosError<ApiResponse>) => {
      showToast({
        type: 'error',
        message:
          error.response?.data?.error?.message || 'Failed to download report',
      })
    },
  })
}

export function useReportTemplates() {
  return useQuery({
    queryKey: reportKeys.templates(),
    queryFn: () => reportApi.getReportTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useReportStatistics() {
  return useQuery({
    queryKey: reportKeys.statistics(),
    queryFn: () => reportApi.getReportStatistics(),
    refetchInterval: 60 * 1000, // Refresh every minute
  })
}

export function useReportStatus(id: string) {
  return useQuery({
    queryKey: reportKeys.status(id),
    queryFn: () => reportApi.getReportStatus(id),
    enabled: !!id,
    refetchInterval: (query) => {
      // Poll while processing
      const data = query.state.data
      const status = data?.status
      if (status === 'processing' || status === 'pending') {
        return 5000 // 5 seconds
      }
      return false
    },
  })
}

export function useCancelReport() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (id: string) => reportApi.cancelReport(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: reportKeys.status(id) })
      showToast({ type: 'success', message: 'Report cancelled' })
    },
    onError: (error: AxiosError<ApiResponse>) => {
      showToast({
        type: 'error',
        message:
          error.response?.data?.error?.message || 'Failed to cancel report',
      })
    },
  })
}

export function useRetryReport() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (id: string) => reportApi.retryReport(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: reportKeys.status(id) })
      showToast({ type: 'success', message: 'Report retry started' })
    },
    onError: (error: AxiosError<ApiResponse>) => {
      showToast({
        type: 'error',
        message:
          error.response?.data?.error?.message || 'Failed to retry report',
      })
    },
  })
}

export function useReportCostPreview() {
  return useMutation({
    mutationFn: (request: ReportRequest) =>
      reportApi.previewReportCost(request),
  })
}

export function useVesselReports(vesselId: string) {
  return useQuery({
    queryKey: reportKeys.vesselReports(vesselId),
    queryFn: () => reportApi.getVesselReports(vesselId),
    enabled: !!vesselId,
  })
}
