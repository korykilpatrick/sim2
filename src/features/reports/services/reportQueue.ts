import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type ReportJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface ReportJob {
  id: string
  reportId: string
  type: 'generate' | 'download' | 'email'
  status: ReportJobStatus
  progress: number
  data: Record<string, unknown>
  error?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

interface ReportQueueStore {
  jobs: Map<string, ReportJob>
  activeJobs: number
  maxConcurrentJobs: number

  // Actions
  addJob: (job: Omit<ReportJob, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateJob: (id: string, updates: Partial<ReportJob>) => void
  removeJob: (id: string) => void
  getJob: (id: string) => ReportJob | undefined
  getJobsByReportId: (reportId: string) => ReportJob[]
  processQueue: () => Promise<void>
  clearCompleted: () => void
}

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

// Job processor
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

// Queue monitor hook
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
