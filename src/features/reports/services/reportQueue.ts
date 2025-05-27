/**
 * @module reportQueue
 * @description Report job queue management for handling background report generation, downloads, and email delivery.
 * Implements a concurrent job processor with progress tracking and state management.
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/**
 * Possible statuses for report jobs
 */
export type ReportJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

/**
 * Report job configuration and state
 * @interface ReportJob
 */
export interface ReportJob {
  /** Unique job identifier */
  id: string
  /** Associated report ID */
  reportId: string
  /** Type of job operation */
  type: 'generate' | 'download' | 'email'
  /** Current job status */
  status: ReportJobStatus
  /** Progress percentage (0-100) */
  progress: number
  /** Additional job data/parameters */
  data: Record<string, unknown>
  /** Error message if job failed */
  error?: string
  /** Job creation timestamp */
  createdAt: Date
  /** Last update timestamp */
  updatedAt: Date
  /** Completion timestamp */
  completedAt?: Date
}

/**
 * Report queue store interface for job management
 * @interface ReportQueueStore
 */
interface ReportQueueStore {
  /** Map of all jobs by ID */
  jobs: Map<string, ReportJob>
  /** Number of currently processing jobs */
  activeJobs: number
  /** Maximum concurrent jobs allowed */
  maxConcurrentJobs: number

  // Actions
  /** Add a new job to the queue */
  addJob: (job: Omit<ReportJob, 'id' | 'createdAt' | 'updatedAt'>) => string
  /** Update an existing job */
  updateJob: (id: string, updates: Partial<ReportJob>) => void
  /** Remove a job from the queue */
  removeJob: (id: string) => void
  /** Get a specific job by ID */
  getJob: (id: string) => ReportJob | undefined
  /** Get all jobs for a specific report */
  getJobsByReportId: (reportId: string) => ReportJob[]
  /** Process pending jobs in the queue */
  processQueue: () => Promise<void>
  /** Clear all completed jobs */
  clearCompleted: () => void
}

/**
 * Report queue store for managing background report jobs with concurrent processing
 * @example
 * ```typescript
 * // Add a report generation job
 * const jobId = useReportQueueStore.getState().addJob({
 *   reportId: 'report123',
 *   type: 'generate',
 *   status: 'pending',
 *   progress: 0,
 *   data: { format: 'pdf', template: 'compliance' }
 * })
 *
 * // Monitor job progress
 * const job = useReportQueueStore.getState().getJob(jobId)
 * console.log(`Progress: ${job.progress}%`)
 * ```
 */
export const useReportQueueStore = create<ReportQueueStore>()(
  devtools(
    (set, get) => ({
      jobs: new Map(),
      activeJobs: 0,
      maxConcurrentJobs: 3,

      addJob: (jobData) => {
        const id = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const job: ReportJob = {
          ...jobData,
          id,
          status: 'pending',
          progress: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => {
          const newJobs = new Map(state.jobs)
          newJobs.set(id, job)
          return { jobs: newJobs }
        })

        // Trigger queue processing
        get().processQueue()

        return id
      },

      updateJob: (id, updates) => {
        set((state) => {
          const job = state.jobs.get(id)
          if (!job) return state

          const updatedJob = {
            ...job,
            ...updates,
            updatedAt: new Date(),
          }

          if (updates.status === 'completed' || updates.status === 'failed') {
            updatedJob.completedAt = new Date()
          }

          const newJobs = new Map(state.jobs)
          newJobs.set(id, updatedJob)

          return { jobs: newJobs }
        })
      },

      removeJob: (id) => {
        set((state) => {
          const newJobs = new Map(state.jobs)
          newJobs.delete(id)
          return { jobs: newJobs }
        })
      },

      getJob: (id) => {
        return get().jobs.get(id)
      },

      getJobsByReportId: (reportId) => {
        const jobs: ReportJob[] = []
        get().jobs.forEach((job) => {
          if (job.reportId === reportId) {
            jobs.push(job)
          }
        })
        return jobs.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        )
      },

      processQueue: async () => {
        const state = get()

        // Don't process if already at max capacity
        if (state.activeJobs >= state.maxConcurrentJobs) {
          return
        }

        // Find pending jobs
        const pendingJobs: ReportJob[] = []
        state.jobs.forEach((job) => {
          if (job.status === 'pending') {
            pendingJobs.push(job)
          }
        })

        // Sort by creation time (FIFO)
        pendingJobs.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        )

        // Process jobs up to max concurrent limit
        const jobsToProcess = pendingJobs.slice(
          0,
          state.maxConcurrentJobs - state.activeJobs,
        )

        for (const job of jobsToProcess) {
          // Update job status to processing
          get().updateJob(job.id, { status: 'processing' })
          set((state) => ({ activeJobs: state.activeJobs + 1 }))

          // Process the job asynchronously
          processJob(job)
            .then(() => {
              get().updateJob(job.id, { status: 'completed', progress: 100 })
            })
            .catch((error) => {
              get().updateJob(job.id, {
                status: 'failed',
                error: error.message || 'Unknown error',
              })
            })
            .finally(() => {
              set((state) => ({
                activeJobs: Math.max(0, state.activeJobs - 1),
              }))
              // Process next job in queue
              get().processQueue()
            })
        }
      },

      clearCompleted: () => {
        set((state) => {
          const newJobs = new Map<string, ReportJob>()
          state.jobs.forEach((job, id) => {
            if (job.status !== 'completed') {
              newJobs.set(id, job)
            }
          })
          return { jobs: newJobs }
        })
      },
    }),
    {
      name: 'report-queue',
    },
  ),
)

/**
 * Process a single job based on its type
 * @param {ReportJob} job - Job to process
 * @returns {Promise<void>} Resolves when job is complete
 * @throws {Error} If job type is unknown
 * @private
 */
async function processJob(job: ReportJob): Promise<void> {
  const { updateJob } = useReportQueueStore.getState()

  switch (job.type) {
    case 'generate':
      // Simulate report generation with progress updates
      for (let i = 0; i <= 100; i += 10) {
        updateJob(job.id, { progress: i })
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
      break

    case 'download':
      // Simulate download preparation
      updateJob(job.id, { progress: 50 })
      await new Promise((resolve) => setTimeout(resolve, 1000))
      updateJob(job.id, { progress: 100 })
      break

    case 'email':
      // Simulate email sending
      updateJob(job.id, { progress: 30 })
      await new Promise((resolve) => setTimeout(resolve, 500))
      updateJob(job.id, { progress: 70 })
      await new Promise((resolve) => setTimeout(resolve, 500))
      updateJob(job.id, { progress: 100 })
      break

    default:
      throw new Error(`Unknown job type: ${job.type}`)
  }
}

/**
 * Hook for monitoring report queue status and statistics
 * @returns {Object} Queue statistics and job list
 * @example
 * ```typescript
 * function QueueStatus() {
 *   const { totalJobs, pendingJobs, processingJobs, failedJobs } = useReportQueueMonitor()
 *
 *   return (
 *     <div>
 *       <p>Total Jobs: {totalJobs}</p>
 *       <p>Pending: {pendingJobs}</p>
 *       <p>Processing: {processingJobs}</p>
 *       <p>Failed: {failedJobs}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useReportQueueMonitor() {
  const jobs = useReportQueueStore((state) => Array.from(state.jobs.values()))
  const activeJobs = useReportQueueStore((state) => state.activeJobs)

  const pendingJobs = jobs.filter((j) => j.status === 'pending').length
  const processingJobs = jobs.filter((j) => j.status === 'processing').length
  const completedJobs = jobs.filter((j) => j.status === 'completed').length
  const failedJobs = jobs.filter((j) => j.status === 'failed').length

  return {
    totalJobs: jobs.length,
    pendingJobs,
    processingJobs,
    completedJobs,
    failedJobs,
    activeJobs,
    jobs,
  }
}
