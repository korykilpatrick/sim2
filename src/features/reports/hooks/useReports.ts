/**
 * Report management hooks for creating, fetching, and managing reports
 * 
 * @module features/reports/hooks
 */

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

/**
 * Hook for fetching reports with optional filtering
 * 
 * Retrieves a paginated list of reports based on filters like type, status,
 * date range, and vessel. Results are cached for 30 seconds.
 * 
 * @param {ReportFilters} filters - Optional filters for report search
 * @returns {UseQueryResult} Query result with reports data
 * 
 * @example
 * ```typescript
 * function ReportsList() {
 *   const { data, isLoading } = useReports({
 *     type: 'compliance',
 *     status: 'completed',
 *     limit: 20
 *   })
 *   
 *   if (isLoading) return <Spinner />
 *   
 *   return (
 *     <div>
 *       {data?.items.map(report => (
 *         <ReportCard key={report.id} report={report} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: () => reportApi.getReports(filters),
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook for fetching a single report by ID
 * 
 * Retrieves detailed report information including status, metadata,
 * and download links. Only fetches when ID is provided.
 * 
 * @param {string} id - Report ID
 * @returns {UseQueryResult} Query result with report data
 * 
 * @example
 * ```typescript
 * function ReportDetail({ reportId }: Props) {
 *   const { data: report, isLoading } = useReport(reportId)
 *   
 *   if (isLoading) return <Spinner />
 *   if (!report) return <NotFound />
 *   
 *   return (
 *     <div>
 *       <h1>{report.name}</h1>
 *       <ReportStatusBadge status={report.status} />
 *       {report.status === 'completed' && (
 *         <DownloadButton reportId={report.id} />
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useReport(id: string) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportApi.getReport(id),
    enabled: !!id,
  })
}

/**
 * Alias for useReport - fetches a single report by ID
 * 
 * @deprecated Use useReport instead
 * @param {string} id - Report ID
 * @returns {UseQueryResult} Query result with report data
 */
export function useReportById(id: string) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportApi.getReport(id),
    enabled: !!id,
  })
}

/**
 * Hook for creating new reports with credit deduction
 * 
 * Handles the full report creation flow including credit cost calculation,
 * balance verification, credit deduction, and report generation. Automatically
 * navigates to the report detail page on success.
 * 
 * @returns {UseMutationResult} Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * function CreateReportForm() {
 *   const createReport = useCreateReport()
 *   const [formData, setFormData] = useState<ReportRequest>()
 *   
 *   const handleSubmit = (e: FormEvent) => {
 *     e.preventDefault()
 *     createReport.mutate(formData, {
 *       onError: (error) => {
 *         // Additional error handling if needed
 *       }
 *     })
 *   }
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <ReportTypeSelector
 *         value={formData.reportType}
 *         onChange={(type) => setFormData({ ...formData, reportType: type })}
 *       />
 *       <button 
 *         type="submit"
 *         disabled={createReport.isPending}
 *       >
 *         {createReport.isPending ? 'Creating...' : 'Generate Report'}
 *       </button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useCreateReport() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { deductCredits } = useCreditDeduction()

  return useMutation({
    mutationFn: async (request: ReportRequest) => {
      // Calculate credit cost based on report type
      const creditCost = creditService.calculateServiceCost({
        service: request.reportType === 'compliance'
          ? 'compliance_report'
          : 'chronology_report',
      })

      // Check if user has sufficient credits
      const hasSufficientCredits =
        await creditService.checkSufficientCredits(creditCost)
      if (!hasSufficientCredits) {
        throw new Error(
          `Insufficient credits. This report requires ${creditCost} credits.`,
        )
      }

      // First deduct credits
      const deductionResult = await deductCredits(
        creditCost,
        `${request.reportType === 'compliance' ? 'Compliance' : 'Chronology'} report`,
      )
      if (!deductionResult.success) {
        throw new Error('Failed to deduct credits')
      }

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

/**
 * Hook for creating multiple reports in bulk
 * 
 * Allows generation of multiple reports for different vessels or time periods
 * in a single operation. Useful for fleet-wide reporting.
 * 
 * @returns {UseMutationResult} Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * function BulkReportCreator({ vessels }: Props) {
 *   const createBulkReports = useCreateBulkReports()
 *   
 *   const handleBulkCreate = () => {
 *     createBulkReports.mutate({
 *       reportType: 'compliance',
 *       vesselIds: vessels.map(v => v.id),
 *       dateRange: { start: startDate, end: endDate }
 *     })
 *   }
 *   
 *   return (
 *     <button
 *       onClick={handleBulkCreate}
 *       disabled={createBulkReports.isPending}
 *     >
 *       Generate {vessels.length} Reports
 *     </button>
 *   )
 * }
 * ```
 */
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

/**
 * Hook for downloading generated reports
 * 
 * Downloads a report in the specified format (PDF, Excel, or JSON).
 * Automatically triggers browser download when successful.
 * 
 * @returns {UseMutationResult} Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * function DownloadReportButton({ report }: Props) {
 *   const downloadReport = useDownloadReport()
 *   
 *   const handleDownload = (format: 'pdf' | 'excel' | 'json') => {
 *     downloadReport.mutate({
 *       reportId: report.id,
 *       format
 *     })
 *   }
 *   
 *   return (
 *     <div>
 *       <button onClick={() => handleDownload('pdf')}>
 *         Download PDF
 *       </button>
 *       <button onClick={() => handleDownload('excel')}>
 *         Download Excel
 *       </button>
 *       {downloadReport.isPending && <Spinner />}
 *     </div>
 *   )
 * }
 * ```
 */
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

/**
 * Hook for fetching available report templates
 * 
 * Retrieves pre-defined report templates that users can use as starting
 * points for their reports. Cached for 10 minutes.
 * 
 * @returns {UseQueryResult} Query result with templates data
 * 
 * @example
 * ```typescript
 * function TemplateSelector({ onSelect }: Props) {
 *   const { data: templates } = useReportTemplates()
 *   
 *   return (
 *     <div>
 *       <h3>Choose a Template</h3>
 *       {templates?.map(template => (
 *         <button
 *           key={template.id}
 *           onClick={() => onSelect(template)}
 *         >
 *           {template.name}
 *         </button>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useReportTemplates() {
  return useQuery({
    queryKey: reportKeys.templates(),
    queryFn: () => reportApi.getReportTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for fetching report statistics
 * 
 * Retrieves aggregate statistics about reports including counts by type,
 * status, and recent activity. Auto-refreshes every minute.
 * 
 * @returns {UseQueryResult} Query result with statistics data
 * 
 * @example
 * ```typescript
 * function ReportsDashboard() {
 *   const { data: stats } = useReportStatistics()
 *   
 *   return (
 *     <div className="grid grid-cols-4 gap-4">
 *       <StatCard
 *         title="Total Reports"
 *         value={stats?.totalReports}
 *       />
 *       <StatCard
 *         title="Processing"
 *         value={stats?.processingCount}
 *       />
 *       <StatCard
 *         title="Completed Today"
 *         value={stats?.completedToday}
 *       />
 *       <StatCard
 *         title="Failed"
 *         value={stats?.failedCount}
 *         variant="error"
 *       />
 *     </div>
 *   )
 * }
 * ```
 */
export function useReportStatistics() {
  return useQuery({
    queryKey: reportKeys.statistics(),
    queryFn: () => reportApi.getReportStatistics(),
    refetchInterval: 60 * 1000, // Refresh every minute
  })
}

/**
 * Hook for tracking report generation status
 * 
 * Monitors the status of a report being generated. Automatically polls
 * every 5 seconds while the report is processing.
 * 
 * @param {string} id - Report ID to track
 * @returns {UseQueryResult} Query result with status data
 * 
 * @example
 * ```typescript
 * function ReportProgress({ reportId }: Props) {
 *   const { data: status } = useReportStatus(reportId)
 *   
 *   return (
 *     <div>
 *       <ProgressBar value={status?.progress || 0} />
 *       <p>Status: {status?.status}</p>
 *       {status?.status === 'failed' && (
 *         <Alert variant="error">{status.error}</Alert>
 *       )}
 *       {status?.status === 'completed' && (
 *         <DownloadButton reportId={reportId} />
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
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

/**
 * Hook for cancelling report generation
 * 
 * Cancels a report that is currently being processed. The report cannot
 * be resumed after cancellation.
 * 
 * @returns {UseMutationResult} Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * function CancelReportButton({ reportId, status }: Props) {
 *   const cancelReport = useCancelReport()
 *   
 *   if (status !== 'processing') return null
 *   
 *   return (
 *     <button
 *       onClick={() => {
 *         if (confirm('Cancel report generation?')) {
 *           cancelReport.mutate(reportId)
 *         }
 *       }}
 *       disabled={cancelReport.isPending}
 *     >
 *       {cancelReport.isPending ? 'Cancelling...' : 'Cancel'}
 *     </button>
 *   )
 * }
 * ```
 */
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

/**
 * Hook for retrying failed report generation
 * 
 * Retries generation of a report that previously failed. Uses the same
 * parameters as the original request.
 * 
 * @returns {UseMutationResult} Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * function RetryReportButton({ report }: Props) {
 *   const retryReport = useRetryReport()
 *   
 *   if (report.status !== 'failed') return null
 *   
 *   return (
 *     <button
 *       onClick={() => retryReport.mutate(report.id)}
 *       disabled={retryReport.isPending}
 *       className="text-blue-600"
 *     >
 *       {retryReport.isPending ? 'Retrying...' : 'Retry Generation'}
 *     </button>
 *   )
 * }
 * ```
 */
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

/**
 * Hook for previewing report generation cost
 * 
 * Calculates the credit cost for a report before creating it. Useful for
 * showing cost estimates in the UI before user commits.
 * 
 * @returns {UseMutationResult} Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * function ReportCostEstimate({ request }: Props) {
 *   const previewCost = useReportCostPreview()
 *   
 *   useEffect(() => {
 *     if (request.vesselIds?.length) {
 *       previewCost.mutate(request)
 *     }
 *   }, [request])
 *   
 *   if (previewCost.isPending) return <Spinner />
 *   
 *   return (
 *     <div className="bg-blue-50 p-4 rounded">
 *       <p>Estimated Cost: {previewCost.data?.credits} credits</p>
 *       <p className="text-sm text-gray-600">
 *         {previewCost.data?.breakdown}
 *       </p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useReportCostPreview() {
  return useMutation({
    mutationFn: (request: ReportRequest) =>
      reportApi.previewReportCost(request),
  })
}

/**
 * Hook for fetching all reports for a specific vessel
 * 
 * Retrieves historical reports generated for a vessel, useful for showing
 * report history in vessel detail views.
 * 
 * @param {string} vesselId - Vessel ID to fetch reports for
 * @returns {UseQueryResult} Query result with vessel reports
 * 
 * @example
 * ```typescript
 * function VesselReportHistory({ vesselId }: Props) {
 *   const { data: reports } = useVesselReports(vesselId)
 *   
 *   return (
 *     <div>
 *       <h3>Report History</h3>
 *       {reports?.length === 0 && (
 *         <p>No reports generated for this vessel</p>
 *       )}
 *       {reports?.map(report => (
 *         <ReportListItem
 *           key={report.id}
 *           report={report}
 *           showVessel={false}
 *         />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useVesselReports(vesselId: string) {
  return useQuery({
    queryKey: reportKeys.vesselReports(vesselId),
    queryFn: () => reportApi.getVesselReports(vesselId),
    enabled: !!vesselId,
  })
}
