import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { areaApi } from '../services/areaService'
import type { AreaFilters, CreateAreaRequest } from '../types'
import { useCreditDeduction } from '@/features/shared/hooks'
import { creditService } from '@/features/shared/services'
import { calculateAreaSize } from '../utils'
import { useToast } from '@/hooks/useToast'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/api/types'
import { areaKeys } from './'

/**
 * Hook for fetching areas with optional filtering
 * 
 * Retrieves a paginated list of areas based on the provided filters.
 * Results are cached for 5 minutes to reduce API calls.
 * 
 * @param {AreaFilters} filters - Optional filters for area search
 * @returns {UseQueryResult} Query result with areas data, loading, and error states
 * 
 * @example
 * ```typescript
 * function AreasList() {
 *   const { data, isLoading, error } = useAreas({
 *     type: 'monitoring',
 *     status: 'active',
 *     page: 1,
 *     limit: 20
 *   })
 *   
 *   if (isLoading) return <Spinner />
 *   if (error) return <Error message={error.message} />
 *   
 *   return (
 *     <div>
 *       {data.items.map(area => (
 *         <AreaCard key={area.id} area={area} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useAreas(filters?: AreaFilters) {
  return useQuery({
    queryKey: areaKeys.list(filters),
    queryFn: () => areaApi.getAreas(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for fetching a single area by ID
 * 
 * Retrieves detailed information about a specific area. The query is only
 * enabled when a valid ID is provided.
 * 
 * @param {string} id - The area ID to fetch
 * @returns {UseQueryResult} Query result with area data, loading, and error states
 * 
 * @example
 * ```typescript
 * function AreaDetail({ areaId }: { areaId: string }) {
 *   const { data: area, isLoading } = useArea(areaId)
 *   
 *   if (isLoading) return <Spinner />
 *   if (!area) return <NotFound />
 *   
 *   return (
 *     <div>
 *       <h1>{area.name}</h1>
 *       <p>{area.description}</p>
 *       <AreaMap geometry={area.geometry} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useArea(id: string) {
  return useQuery({
    queryKey: areaKeys.detail(id),
    queryFn: () => areaApi.getArea(id),
    enabled: !!id,
  })
}

/**
 * Hook for creating new areas with credit deduction
 * 
 * Handles the full area creation flow including credit cost calculation,
 * balance verification, credit deduction, and area creation. Automatically
 * invalidates related queries and shows toast notifications.
 * 
 * @returns {UseMutationResult} Mutation object with mutate function and status
 * 
 * @example
 * ```typescript
 * function CreateAreaForm() {
 *   const createArea = useCreateArea()
 *   
 *   const handleSubmit = (data: CreateAreaRequest) => {
 *     createArea.mutate(data, {
 *       onSuccess: (area) => {
 *         router.push(`/areas/${area.id}`)
 *       }
 *     })
 *   }
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {createArea.isError && (
 *         <Alert variant="error">{createArea.error.message}</Alert>
 *       )}
 *       <button 
 *         type="submit" 
 *         disabled={createArea.isPending}
 *       >
 *         {createArea.isPending ? 'Creating...' : 'Create Area'}
 *       </button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useCreateArea() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { deductCredits } = useCreditDeduction()

  return useMutation({
    mutationFn: async (data: CreateAreaRequest) => {
      // Calculate credit cost
      const days = data.duration
      const areaSize = calculateAreaSize(data.geometry)
      const creditCost = creditService.calculateServiceCost({
        service: 'area_monitoring',
        areaSize,
        days,
      })

      // Check if user has sufficient credits
      const hasSufficientCredits =
        await creditService.checkSufficientCredits(creditCost)
      if (!hasSufficientCredits) {
        throw new Error(
          `Insufficient credits. This monitoring requires ${creditCost} credits.`,
        )
      }

      // First deduct credits
      const deductionResult = await deductCredits(creditCost, `Area monitoring for "${data.name}"`)
      if (!deductionResult.success) {
        throw new Error('Failed to deduct credits')
      }

      // Then create the area
      return areaApi.createArea(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.all })
      queryClient.invalidateQueries({ queryKey: areaKeys.statistics() })
      showToast({ type: 'success', message: 'Area created successfully' })
    },
    onError: (error: AxiosError<{ error?: ApiError }>) => {
      showToast({
        type: 'error',
        message:
          error.response?.data?.error?.message ||
          error.message ||
          'Failed to create area',
      })
    },
  })
}

/**
 * Hook for updating an existing area
 * 
 * Updates area properties such as name, description, or monitoring settings.
 * Automatically invalidates related queries and shows toast notifications.
 * 
 * @param {string} id - The ID of the area to update
 * @returns {UseMutationResult} Mutation object with mutate function and status
 * 
 * @example
 * ```typescript
 * function EditAreaForm({ areaId }: { areaId: string }) {
 *   const updateArea = useUpdateArea(areaId)
 *   const { data: area } = useArea(areaId)
 *   
 *   const handleSubmit = (updates: Partial<CreateAreaRequest>) => {
 *     updateArea.mutate(updates, {
 *       onSuccess: () => {
 *         router.push(`/areas/${areaId}`)
 *       }
 *     })
 *   }
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input 
 *         defaultValue={area?.name}
 *         name="name"
 *       />
 *       <button 
 *         type="submit"
 *         disabled={updateArea.isPending}
 *       >
 *         {updateArea.isPending ? 'Saving...' : 'Save Changes'}
 *       </button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useUpdateArea(id: string) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (data: Partial<CreateAreaRequest>) =>
      areaApi.updateArea(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.all })
      queryClient.invalidateQueries({ queryKey: areaKeys.detail(id) })
      showToast({ type: 'success', message: 'Area updated successfully' })
    },
    onError: (error: AxiosError<{ error?: ApiError }>) => {
      showToast({
        type: 'error',
        message:
          error.response?.data?.error?.message || 'Failed to update area',
      })
    },
  })
}

/**
 * Hook for deleting areas
 * 
 * Permanently deletes an area and all associated monitoring data.
 * Automatically invalidates related queries and shows toast notifications.
 * 
 * @returns {UseMutationResult} Mutation object with mutate function and status
 * 
 * @example
 * ```typescript
 * function DeleteAreaButton({ areaId }: { areaId: string }) {
 *   const deleteArea = useDeleteArea()
 *   const [showConfirm, setShowConfirm] = useState(false)
 *   
 *   const handleDelete = () => {
 *     deleteArea.mutate(areaId, {
 *       onSuccess: () => {
 *         router.push('/areas')
 *       }
 *     })
 *   }
 *   
 *   return (
 *     <>
 *       <button onClick={() => setShowConfirm(true)}>
 *         Delete Area
 *       </button>
 *       
 *       {showConfirm && (
 *         <ConfirmDialog
 *           onConfirm={handleDelete}
 *           onCancel={() => setShowConfirm(false)}
 *           isLoading={deleteArea.isPending}
 *         />
 *       )}
 *     </>
 *   )
 * }
 * ```
 */
export function useDeleteArea() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (id: string) => areaApi.deleteArea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: areaKeys.all })
      queryClient.invalidateQueries({ queryKey: areaKeys.statistics() })
      showToast({ type: 'success', message: 'Area deleted successfully' })
    },
    onError: (error: AxiosError<{ error?: ApiError }>) => {
      showToast({
        type: 'error',
        message:
          error.response?.data?.error?.message || 'Failed to delete area',
      })
    },
  })
}
