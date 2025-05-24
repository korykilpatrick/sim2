import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { areaApi } from '../services/areaService'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/api/types'
import { areaKeys } from './'

export function useAreaMonitoring(areaId: string) {
  return useQuery({
    queryKey: areaKeys.monitoring(areaId),
    queryFn: () => areaApi.getAreaMonitoring(areaId),
    enabled: !!areaId,
  })
}

export function useStartMonitoring(areaId: string) {
  const queryClient = useQueryClient()

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
      toast.success('Monitoring started successfully')
    },
    onError: (error: AxiosError<{ error?: ApiError }>) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to start monitoring',
      )
    },
  })
}

export function usePauseMonitoring(areaId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => areaApi.pauseMonitoring(areaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.monitoring(areaId) })
      toast.success('Monitoring paused')
    },
    onError: (error: AxiosError<{ error?: ApiError }>) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to pause monitoring',
      )
    },
  })
}

export function useResumeMonitoring(areaId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => areaApi.resumeMonitoring(areaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.monitoring(areaId) })
      toast.success('Monitoring resumed')
    },
    onError: (error: AxiosError<{ error?: ApiError }>) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to resume monitoring',
      )
    },
  })
}

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

export function useAreaStatistics() {
  return useQuery({
    queryKey: areaKeys.statistics(),
    queryFn: () => areaApi.getAreaStatistics(),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useMonitoringCriteria() {
  return useQuery({
    queryKey: areaKeys.criteria(),
    queryFn: () => areaApi.getMonitoringCriteria(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

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

export function useVesselsInArea(areaId: string) {
  return useQuery({
    queryKey: areaKeys.vessels(areaId),
    queryFn: () => areaApi.getVesselsInArea(areaId),
    enabled: !!areaId,
    refetchInterval: 60 * 1000, // Refresh every minute
  })
}
