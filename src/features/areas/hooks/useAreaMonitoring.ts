import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { areaApi } from '../services/areaService'
import { useToast } from '@/hooks/useToast'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/api/types'
import { areaKeys } from './'

/**
 * Hook for fetching area monitoring data
 * 
 * Retrieves current monitoring status, configuration, and statistics for an area.
 * Only fetches data when a valid area ID is provided.
 * 
 * @param {string} areaId - The ID of the area to monitor
 * @returns {UseQueryResult} Query result with monitoring data
 * 
 * @example
 * ```typescript
 * function AreaMonitoringDashboard({ areaId }: { areaId: string }) {
 *   const { data: monitoring, isLoading } = useAreaMonitoring(areaId)
 *   
 *   if (isLoading) return <Spinner />
 *   
 *   return (
 *     <div>
 *       <h2>Monitoring Status: {monitoring.status}</h2>
 *       <p>Update Frequency: {monitoring.updateFrequency}h</p>
 *       <p>Vessels in Area: {monitoring.vesselCount}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useAreaMonitoring(areaId: string) {
  return useQuery({
    queryKey: areaKeys.monitoring(areaId),
    queryFn: () => areaApi.getAreaMonitoring(areaId),
    enabled: !!areaId,
  })
}

/**
 * Hook for starting area monitoring
 * 
 * Initiates monitoring for an area with specified configuration. Handles credit
 * deduction and shows success/error notifications.
 * 
 * @param {string} areaId - The ID of the area to start monitoring
 * @returns {UseMutationResult} Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * function StartMonitoringButton({ areaId }: { areaId: string }) {
 *   const startMonitoring = useStartMonitoring(areaId)
 *   
 *   const handleStart = () => {
 *     startMonitoring.mutate({
 *       criteria: ['vessel_entry', 'vessel_exit'],
 *       updateFrequency: 6,
 *       duration: 30,
 *       alertsEnabled: true
 *     })
 *   }
 *   
 *   return (
 *     <button 
 *       onClick={handleStart}
 *       disabled={startMonitoring.isPending}
 *     >
 *       {startMonitoring.isPending ? 'Starting...' : 'Start Monitoring'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useStartMonitoring(areaId: string) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (config: {
      criteria: string[]
      updateFrequency: 3 | 6 | 12 | 24
      duration: number
      alertsEnabled: boolean
    }) => areaApi.startMonitoring(areaId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.monitoring(areaId) })
      queryClient.invalidateQueries({ queryKey: areaKeys.detail(areaId) })
      showToast({ type: 'success', message: 'Monitoring started successfully' })
    },
    onError: (error: AxiosError<{ error?: ApiError }>) => {
      showToast({
        type: 'error',
        message:
          error.response?.data?.error?.message || 'Failed to start monitoring',
      })
    },
  })
}

/**
 * Hook for pausing area monitoring
 * 
 * Temporarily pauses active monitoring for an area. Monitoring can be resumed
 * later without losing configuration.
 * 
 * @param {string} areaId - The ID of the area to pause monitoring
 * @returns {UseMutationResult} Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * function MonitoringControls({ areaId }: { areaId: string }) {
 *   const pauseMonitoring = usePauseMonitoring(areaId)
 *   
 *   return (
 *     <button 
 *       onClick={() => pauseMonitoring.mutate()}
 *       disabled={pauseMonitoring.isPending}
 *     >
 *       {pauseMonitoring.isPending ? 'Pausing...' : 'Pause'}
 *     </button>
 *   )
 * }
 * ```
 */
export function usePauseMonitoring(areaId: string) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: () => areaApi.pauseMonitoring(areaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.monitoring(areaId) })
      showToast({ type: 'success', message: 'Monitoring paused' })
    },
    onError: (error: AxiosError<{ error?: ApiError }>) => {
      showToast({
        type: 'error',
        message:
          error.response?.data?.error?.message || 'Failed to pause monitoring',
      })
    },
  })
}

/**
 * Hook for resuming paused area monitoring
 * 
 * Resumes monitoring that was previously paused, maintaining the original
 * configuration and schedule.
 * 
 * @param {string} areaId - The ID of the area to resume monitoring
 * @returns {UseMutationResult} Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * function MonitoringControls({ areaId, isPaused }: Props) {
 *   const resumeMonitoring = useResumeMonitoring(areaId)
 *   
 *   if (!isPaused) return null
 *   
 *   return (
 *     <button 
 *       onClick={() => resumeMonitoring.mutate()}
 *       disabled={resumeMonitoring.isPending}
 *     >
 *       {resumeMonitoring.isPending ? 'Resuming...' : 'Resume'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useResumeMonitoring(areaId: string) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: () => areaApi.resumeMonitoring(areaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.monitoring(areaId) })
      showToast({ type: 'success', message: 'Monitoring resumed' })
    },
    onError: (error: AxiosError<{ error?: ApiError }>) => {
      showToast({
        type: 'error',
        message:
          error.response?.data?.error?.message || 'Failed to resume monitoring',
      })
    },
  })
}

/**
 * Hook for fetching area alerts with filtering
 * 
 * Retrieves alerts generated by area monitoring with optional filters for
 * severity, type, read status, and pagination.
 * 
 * @param {string} areaId - The ID of the area
 * @param {Object} filters - Optional filters for alerts
 * @param {boolean} filters.enabled - Filter by enabled status
 * @param {'low' | 'medium' | 'high' | 'critical'} filters.severity - Filter by severity
 * @param {string} filters.type - Filter by alert type
 * @param {boolean} filters.isRead - Filter by read status
 * @param {number} filters.limit - Number of alerts per page
 * @param {number} filters.page - Page number
 * @returns {UseQueryResult} Query result with alerts data
 * 
 * @example
 * ```typescript
 * function AreaAlerts({ areaId }: { areaId: string }) {
 *   const { data: alerts } = useAreaAlerts(areaId, {
 *     severity: 'high',
 *     isRead: false,
 *     limit: 10
 *   })
 *   
 *   return (
 *     <div>
 *       {alerts?.items.map(alert => (
 *         <AlertCard key={alert.id} alert={alert} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useAreaAlerts(
  areaId: string,
  filters?: {
    enabled?: boolean
    severity?: 'low' | 'medium' | 'high' | 'critical'
    type?: string
    isRead?: boolean
    limit?: number
    page?: number
  },
) {
  return useQuery({
    queryKey: areaKeys.alerts(areaId, filters),
    queryFn: () => areaApi.getAreaAlerts(areaId, filters),
    enabled: !!areaId,
  })
}

/**
 * Hook for marking alerts as read
 * 
 * Updates the read status of a specific alert. Automatically invalidates
 * the alerts query to reflect the change.
 * 
 * @returns {UseMutationResult} Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * function AlertItem({ alert, areaId }: Props) {
 *   const markAsRead = useMarkAlertRead()
 *   
 *   const handleClick = () => {
 *     if (!alert.isRead) {
 *       markAsRead.mutate({ areaId, alertId: alert.id })
 *     }
 *   }
 *   
 *   return (
 *     <div 
 *       onClick={handleClick}
 *       className={alert.isRead ? 'opacity-60' : ''}
 *     >
 *       {alert.message}
 *     </div>
 *   )
 * }
 * ```
 */
export function useMarkAlertRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ areaId, alertId }: { areaId: string; alertId: string }) =>
      areaApi.markAlertRead(areaId, alertId),
    onSuccess: (_, { areaId }) => {
      queryClient.invalidateQueries({ queryKey: areaKeys.alerts(areaId) })
    },
  })
}

/**
 * Hook for fetching global area statistics
 * 
 * Retrieves aggregate statistics across all areas including total count,
 * active monitoring count, and alert summaries. Cached for 30 seconds.
 * 
 * @returns {UseQueryResult} Query result with statistics data
 * 
 * @example
 * ```typescript
 * function AreasDashboard() {
 *   const { data: stats } = useAreaStatistics()
 *   
 *   return (
 *     <div className="grid grid-cols-3 gap-4">
 *       <StatCard title="Total Areas" value={stats?.totalAreas} />
 *       <StatCard title="Active Monitoring" value={stats?.activeMonitoring} />
 *       <StatCard title="Alerts Today" value={stats?.alertsToday} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useAreaStatistics() {
  return useQuery({
    queryKey: areaKeys.statistics(),
    queryFn: () => areaApi.getAreaStatistics(),
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook for fetching available monitoring criteria
 * 
 * Retrieves the list of monitoring criteria that can be applied to areas,
 * such as vessel entry/exit, speed violations, etc. Cached for 10 minutes.
 * 
 * @returns {UseQueryResult} Query result with criteria list
 * 
 * @example
 * ```typescript
 * function CriteriaSelector({ selected, onChange }: Props) {
 *   const { data: criteria } = useMonitoringCriteria()
 *   
 *   return (
 *     <div>
 *       {criteria?.map(criterion => (
 *         <label key={criterion.id}>
 *           <input
 *             type="checkbox"
 *             checked={selected.includes(criterion.id)}
 *             onChange={() => onChange(criterion.id)}
 *           />
 *           {criterion.name} - {criterion.description}
 *         </label>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useMonitoringCriteria() {
  return useQuery({
    queryKey: areaKeys.criteria(),
    queryFn: () => areaApi.getMonitoringCriteria(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for calculating area monitoring costs
 * 
 * Calculates the credit cost for monitoring an area based on size, criteria,
 * update frequency, and duration. Only calculates when valid config is provided.
 * 
 * @param {Object} config - Cost calculation parameters
 * @param {number} config.sizeKm2 - Area size in square kilometers
 * @param {string[]} config.criteria - Selected monitoring criteria IDs
 * @param {number} config.updateFrequency - Update frequency in hours
 * @param {number} config.duration - Monitoring duration in days
 * @returns {UseQueryResult} Query result with cost calculation
 * 
 * @example
 * ```typescript
 * function CostEstimate({ areaSize, criteria }: Props) {
 *   const { data: cost } = useAreaCostCalculation({
 *     sizeKm2: areaSize,
 *     criteria: criteria,
 *     updateFrequency: 6,
 *     duration: 30
 *   })
 *   
 *   return (
 *     <div>
 *       <p>Estimated Cost: {cost?.credits} credits</p>
 *       <p>Daily Rate: {cost?.dailyRate} credits/day</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useAreaCostCalculation(config: {
  sizeKm2: number
  criteria: string[]
  updateFrequency: number
  duration: number
}) {
  return useQuery({
    queryKey: areaKeys.cost(config),
    queryFn: () => areaApi.calculateCost(config),
    enabled: config.sizeKm2 > 0 && config.criteria.length > 0,
  })
}

/**
 * Hook for fetching vessels currently in an area
 * 
 * Retrieves real-time list of vessels within the area boundaries. Automatically
 * refreshes every minute to keep data current.
 * 
 * @param {string} areaId - The ID of the area
 * @returns {UseQueryResult} Query result with vessels list
 * 
 * @example
 * ```typescript
 * function VesselsInArea({ areaId }: { areaId: string }) {
 *   const { data: vessels } = useVesselsInArea(areaId)
 *   
 *   return (
 *     <div>
 *       <h3>Vessels in Area ({vessels?.length || 0})</h3>
 *       <ul>
 *         {vessels?.map(vessel => (
 *           <li key={vessel.id}>
 *             {vessel.name} - {vessel.type}
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   )
 * }
 * ```
 */
export function useVesselsInArea(areaId: string) {
  return useQuery({
    queryKey: areaKeys.vessels(areaId),
    queryFn: () => areaApi.getVesselsInArea(areaId),
    enabled: !!areaId,
    refetchInterval: 60 * 1000, // Refresh every minute
  })
}
