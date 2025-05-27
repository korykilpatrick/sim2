import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { investigationService } from '../services/investigationService'
import {
  Investigation,
  InvestigationRequest,
  InvestigationFilters,
} from '../types'

/**
 * Hook for fetching investigations with optional filtering
 *
 * Retrieves a paginated list of investigations based on filters such as
 * status, priority, vessel, or date range.
 *
 * @param {InvestigationFilters} filters - Optional filters for investigations
 * @returns {UseQueryResult} Query result with investigations data
 *
 * @example
 * ```typescript
 * function InvestigationsList() {
 *   const { data, isLoading } = useInvestigations({
 *     status: 'pending',
 *     priority: 'high',
 *     limit: 20
 *   })
 *
 *   if (isLoading) return <Spinner />
 *
 *   return (
 *     <div>
 *       {data?.items.map(investigation => (
 *         <InvestigationCard
 *           key={investigation.id}
 *           investigation={investigation}
 *         />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useInvestigations(filters?: InvestigationFilters) {
  return useQuery({
    queryKey: ['investigations', filters],
    queryFn: () => investigationService.getInvestigations(filters),
  })
}

/**
 * Hook for fetching a single investigation by ID
 *
 * Retrieves detailed information about an investigation including status,
 * findings, documents, and consultation history.
 *
 * @param {string} id - The investigation ID
 * @returns {UseQueryResult} Query result with investigation data
 *
 * @example
 * ```typescript
 * function InvestigationDetail({ investigationId }: Props) {
 *   const { data: investigation, isLoading } = useInvestigation(investigationId)
 *
 *   if (isLoading) return <Spinner />
 *   if (!investigation) return <NotFound />
 *
 *   return (
 *     <div>
 *       <h1>{investigation.title}</h1>
 *       <p>Status: {investigation.status}</p>
 *       <p>Priority: {investigation.priority}</p>
 *       <Documents items={investigation.documents} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useInvestigation(id: string) {
  return useQuery({
    queryKey: ['investigation', id],
    queryFn: () => investigationService.getInvestigation(id),
    enabled: !!id,
  })
}

/**
 * Hook for creating new investigations
 *
 * Initiates a new investigation request with specified details. Automatically
 * invalidates the investigations list query on success.
 *
 * @returns {UseMutationResult} Mutation object with mutate function
 *
 * @example
 * ```typescript
 * function CreateInvestigationForm() {
 *   const createInvestigation = useCreateInvestigation()
 *   const router = useRouter()
 *
 *   const handleSubmit = (data: InvestigationRequest) => {
 *     createInvestigation.mutate(data, {
 *       onSuccess: (investigation) => {
 *         showToast({
 *           type: 'success',
 *           message: 'Investigation created successfully'
 *         })
 *         router.push(`/investigations/${investigation.id}`)
 *       },
 *       onError: (error) => {
 *         showToast({
 *           type: 'error',
 *           message: error.message
 *         })
 *       }
 *     })
 *   }
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       // Form fields go here
 *       <button
 *         type="submit"
 *         disabled={createInvestigation.isPending}
 *       >
 *         {createInvestigation.isPending ? 'Creating...' : 'Create Investigation'}
 *       </button>
 *     </form>
 *   )
 * }
 * ```
 */
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

/**
 * Hook for updating investigation details
 *
 * Updates investigation properties such as status, findings, or priority.
 * Invalidates both the specific investigation and list queries.
 *
 * @returns {UseMutationResult} Mutation object with mutate function
 *
 * @example
 * ```typescript
 * function UpdateInvestigationStatus({ investigation }: Props) {
 *   const updateInvestigation = useUpdateInvestigation()
 *
 *   const handleStatusChange = (newStatus: string) => {
 *     updateInvestigation.mutate({
 *       id: investigation.id,
 *       data: { status: newStatus }
 *     }, {
 *       onSuccess: () => {
 *         showToast({
 *           type: 'success',
 *           message: 'Status updated'
 *         })
 *       }
 *     })
 *   }
 *
 *   return (
 *     <select
 *       value={investigation.status}
 *       onChange={(e) => handleStatusChange(e.target.value)}
 *       disabled={updateInvestigation.isPending}
 *     >
 *       <option value="pending">Pending</option>
 *       <option value="in_progress">In Progress</option>
 *       <option value="completed">Completed</option>
 *     </select>
 *   )
 * }
 * ```
 */
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

/**
 * Hook for scheduling expert consultations
 *
 * Schedules a consultation with an expert for the investigation. Updates
 * the investigation details with the consultation information.
 *
 * @returns {UseMutationResult} Mutation object with mutate function
 *
 * @example
 * ```typescript
 * function ScheduleConsultationForm({ investigationId }: Props) {
 *   const scheduleConsultation = useScheduleConsultation()
 *   const [date, setDate] = useState('')
 *   const [notes, setNotes] = useState('')
 *
 *   const handleSchedule = () => {
 *     scheduleConsultation.mutate({
 *       investigationId,
 *       date,
 *       notes
 *     }, {
 *       onSuccess: () => {
 *         showToast({
 *           type: 'success',
 *           message: 'Consultation scheduled'
 *         })
 *         setDate('')
 *         setNotes('')
 *       }
 *     })
 *   }
 *
 *   return (
 *     <div>
 *       <DatePicker value={date} onChange={setDate} />
 *       <textarea
 *         value={notes}
 *         onChange={(e) => setNotes(e.target.value)}
 *         placeholder="Consultation notes..."
 *       />
 *       <button
 *         onClick={handleSchedule}
 *         disabled={!date || scheduleConsultation.isPending}
 *       >
 *         {scheduleConsultation.isPending ? 'Scheduling...' : 'Schedule'}
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
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

/**
 * Hook for uploading documents to an investigation
 *
 * Uploads one or more documents/files to an investigation. Supports various
 * file types including PDFs, images, and spreadsheets.
 *
 * @returns {UseMutationResult} Mutation object with mutate function
 *
 * @example
 * ```typescript
 * function DocumentUpload({ investigationId }: Props) {
 *   const uploadDocument = useUploadDocument()
 *   const fileInputRef = useRef<HTMLInputElement>(null)
 *
 *   const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
 *     const files = Array.from(event.target.files || [])
 *     if (files.length === 0) return
 *
 *     uploadDocument.mutate({
 *       investigationId,
 *       files
 *     }, {
 *       onSuccess: () => {
 *         showToast({
 *           type: 'success',
 *           message: `${files.length} file(s) uploaded`
 *         })
 *         if (fileInputRef.current) {
 *           fileInputRef.current.value = ''
 *         }
 *       },
 *       onError: (error) => {
 *         showToast({
 *           type: 'error',
 *           message: 'Upload failed: ' + error.message
 *         })
 *       }
 *     })
 *   }
 *
 *   return (
 *     <div>
 *       <input
 *         ref={fileInputRef}
 *         type="file"
 *         multiple
 *         onChange={handleUpload}
 *         disabled={uploadDocument.isPending}
 *       />
 *       {uploadDocument.isPending && <p>Uploading...</p>}
 *     </div>
 *   )
 * }
 * ```
 */
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

/**
 * Hook for deleting documents from an investigation
 *
 * Removes a document from an investigation. The document will be permanently
 * deleted and cannot be recovered.
 *
 * @returns {UseMutationResult} Mutation object with mutate function
 *
 * @example
 * ```typescript
 * function DocumentItem({ investigationId, document }: Props) {
 *   const deleteDocument = useDeleteDocument()
 *   const [showConfirm, setShowConfirm] = useState(false)
 *
 *   const handleDelete = () => {
 *     deleteDocument.mutate({
 *       investigationId,
 *       documentId: document.id
 *     }, {
 *       onSuccess: () => {
 *         showToast({
 *           type: 'success',
 *           message: 'Document deleted'
 *         })
 *         setShowConfirm(false)
 *       }
 *     })
 *   }
 *
 *   return (
 *     <div className="flex items-center justify-between">
 *       <span>{document.name}</span>
 *       <button onClick={() => setShowConfirm(true)}>
 *         Delete
 *       </button>
 *
 *       {showConfirm && (
 *         <ConfirmDialog
 *           message="Delete this document?"
 *           onConfirm={handleDelete}
 *           onCancel={() => setShowConfirm(false)}
 *           isLoading={deleteDocument.isPending}
 *         />
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
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

/**
 * Hook for downloading investigation reports
 *
 * Downloads a generated investigation report as a PDF file. The report includes
 * all findings, evidence, and expert consultations.
 *
 * @returns {UseMutationResult} Mutation object with mutate function
 *
 * @example
 * ```typescript
 * function DownloadReportButton({ reportId, reportName }: Props) {
 *   const downloadReport = useDownloadReport()
 *
 *   const handleDownload = () => {
 *     downloadReport.mutate(reportId, {
 *       onSuccess: (blob) => {
 *         // Create download link
 *         const url = window.URL.createObjectURL(blob)
 *         const link = document.createElement('a')
 *         link.href = url
 *         link.download = `${reportName}.pdf`
 *         document.body.appendChild(link)
 *         link.click()
 *         document.body.removeChild(link)
 *         window.URL.revokeObjectURL(url)
 *
 *         showToast({
 *           type: 'success',
 *           message: 'Report downloaded'
 *         })
 *       },
 *       onError: (error) => {
 *         showToast({
 *           type: 'error',
 *           message: 'Download failed: ' + error.message
 *         })
 *       }
 *     })
 *   }
 *
 *   return (
 *     <button
 *       onClick={handleDownload}
 *       disabled={downloadReport.isPending}
 *     >
 *       {downloadReport.isPending ? 'Downloading...' : 'Download Report'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useDownloadReport() {
  return useMutation({
    mutationFn: (reportId: string) =>
      investigationService.downloadReport(reportId),
  })
}
