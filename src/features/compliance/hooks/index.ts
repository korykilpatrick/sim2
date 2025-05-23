import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { complianceService } from '../services'
import type { ReportRequest, ReportFilter } from '../types'

// Query keys
export const complianceKeys = {
  all: ['compliance'] as const,
  reports: () => [...complianceKeys.all, 'reports'] as const,
  report: (id: string) => [...complianceKeys.reports(), id] as const,
  list: (filters?: ReportFilter) =>
    [...complianceKeys.reports(), 'list', filters] as const,
  status: (id: string) => [...complianceKeys.report(id), 'status'] as const,
  pricing: () => [...complianceKeys.all, 'pricing'] as const,
}

// Hooks
export function useComplianceReport(reportId: string) {
  return useQuery({
    queryKey: complianceKeys.report(reportId),
    queryFn: () => complianceService.getReport(reportId),
    enabled: !!reportId,
  })
}

export function useComplianceReports(filters?: ReportFilter) {
  return useQuery({
    queryKey: complianceKeys.list(filters),
    queryFn: () => complianceService.listReports(filters),
  })
}

export function useGenerateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: ReportRequest) =>
      complianceService.generateReport(request),
    onSuccess: (report) => {
      // Invalidate reports list
      queryClient.invalidateQueries({ queryKey: complianceKeys.reports() })
      // Add the new report to cache
      queryClient.setQueryData(complianceKeys.report(report.id), report)
    },
  })
}

export function useReportStatus(reportId: string, enabled = true) {
  return useQuery({
    queryKey: complianceKeys.status(reportId),
    queryFn: () => complianceService.getReportStatus(reportId),
    enabled: enabled && !!reportId,
    refetchInterval: (query) => {
      // Poll every 2 seconds while processing
      const data = query.state.data
      if (data && (data.status === 'pending' || data.status === 'processing')) {
        return 2000
      }
      return false
    },
  })
}

export function useCancelReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reportId: string) => complianceService.cancelReport(reportId),
    onSuccess: (_, reportId) => {
      // Invalidate the specific report and list
      queryClient.invalidateQueries({
        queryKey: complianceKeys.report(reportId),
      })
      queryClient.invalidateQueries({ queryKey: complianceKeys.reports() })
    },
  })
}

export function useReportPricing() {
  return useQuery({
    queryKey: complianceKeys.pricing(),
    queryFn: () => complianceService.getReportPricing(),
    staleTime: 5 * 60 * 1000, // Consider pricing fresh for 5 minutes
  })
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: async ({
      reportId,
      fileName,
    }: {
      reportId: string
      fileName: string
    }) => {
      const blob = await complianceService.downloadReport(reportId)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },
  })
}

export function usePreviewReport() {
  return useMutation({
    mutationFn: (request: ReportRequest) =>
      complianceService.previewReport(request),
  })
}
