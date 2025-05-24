import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportApi } from '../services/reportService'
import type { ReportFilters, ReportRequest, BulkReportRequest } from '../types'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/types/api'
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

  return useMutation({
    mutationFn: (request: ReportRequest) => reportApi.createReport(request),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      queryClient.invalidateQueries({ queryKey: reportKeys.statistics() })
      toast.success('Report generation started')
      navigate(`/reports/${response.reportId}`)
    },
    onError: (error: AxiosError<ApiResponse>) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to create report',
      )
    },
  })
}

export function useCreateBulkReports() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: BulkReportRequest) =>
      reportApi.createBulkReports(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      queryClient.invalidateQueries({ queryKey: reportKeys.statistics() })
      toast.success('Bulk report generation started')
    },
    onError: (error: AxiosError<ApiResponse>) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to create bulk reports',
      )
    },
  })
}

export function useDownloadReport() {
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
      toast.success('Report downloaded successfully')
    },
    onError: (error: AxiosError<ApiResponse>) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to download report',
      )
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

  return useMutation({
    mutationFn: (id: string) => reportApi.cancelReport(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: reportKeys.status(id) })
      toast.success('Report cancelled')
    },
    onError: (error: AxiosError<ApiResponse>) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to cancel report',
      )
    },
  })
}

export function useRetryReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reportApi.retryReport(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all })
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: reportKeys.status(id) })
      toast.success('Report retry started')
    },
    onError: (error: AxiosError<ApiResponse>) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to retry report',
      )
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
