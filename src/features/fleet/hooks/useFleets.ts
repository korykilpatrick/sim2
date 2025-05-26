import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fleetService } from '../services/fleetService'
import type { CreateFleetInput, UpdateFleetInput } from '../types'
import { useToast } from '@/hooks/useToast'
import { fleetKeys } from './'

/**
 * Hook to fetch all fleets for the current user
 * @returns {UseQueryResult<Fleet[]>} Query result with fleets data
 * @example
 * ```typescript
 * function FleetList() {
 *   const { data: fleets, isLoading, error } = useFleets()
 *   
 *   if (isLoading) return <Spinner />
 *   if (error) return <Error message={error.message} />
 *   
 *   return (
 *     <ul>
 *       {fleets?.map(fleet => (
 *         <li key={fleet.id}>{fleet.name} - {fleet.vesselCount} vessels</li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export const useFleets = () => {
  return useQuery({
    queryKey: fleetKeys.all,
    queryFn: fleetService.getFleets,
  })
}

/**
 * Hook to fetch a specific fleet by ID
 * @param {string} id - Fleet ID to fetch
 * @returns {UseQueryResult<Fleet>} Query result with fleet data
 * @example
 * ```typescript
 * function FleetDetail({ fleetId }: { fleetId: string }) {
 *   const { data: fleet, isLoading } = useFleet(fleetId)
 *   
 *   if (isLoading) return <Spinner />
 *   
 *   return (
 *     <div>
 *       <h1>{fleet?.name}</h1>
 *       <p>{fleet?.description}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export const useFleet = (id: string) => {
  return useQuery({
    queryKey: fleetKeys.detail(id),
    queryFn: () => fleetService.getFleet(id),
    enabled: !!id,
  })
}

/**
 * Hook to fetch fleet statistics
 * @returns {UseQueryResult<FleetStats>} Query result with fleet statistics
 * @example
 * ```typescript
 * function FleetDashboard() {
 *   const { data: stats } = useFleetStats()
 *   
 *   return (
 *     <div>
 *       <div>Total Fleets: {stats?.totalFleets}</div>
 *       <div>Total Vessels: {stats?.totalVessels}</div>
 *       <div>Active Trackings: {stats?.activeTrackings}</div>
 *     </div>
 *   )
 * }
 * ```
 */
export const useFleetStats = () => {
  return useQuery({
    queryKey: fleetKeys.stats(),
    queryFn: fleetService.getFleetStats,
  })
}

/**
 * Hook to create a new fleet
 * @returns {UseMutationResult} Mutation object with mutate function and status
 * @example
 * ```typescript
 * function CreateFleetForm() {
 *   const createFleet = useCreateFleet()
 *   
 *   const handleSubmit = (data: CreateFleetInput) => {
 *     createFleet.mutate(data, {
 *       onSuccess: (fleet) => {
 *         console.log('Created fleet:', fleet.id)
 *         navigate('/fleets/' + fleet.id)
 *       }
 *     })
 *   }
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {createFleet.isLoading && <Spinner />}
 *       // form fields
 *     </form>
 *   )
 * }
 * ```
 */
export const useCreateFleet = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: async (data: CreateFleetInput) => {
      // Note: Credit deduction will happen when vessels are added to the fleet
      // since CreateFleetInput doesn't include vessel IDs
      return fleetService.createFleet(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all })
      queryClient.invalidateQueries({ queryKey: fleetKeys.stats() })
      showToast({ type: 'success', message: 'Fleet created successfully' })
    },
    onError: (error: Error) => {
      showToast({
        type: 'error',
        message: error.message || 'Failed to create fleet',
      })
    },
  })
}

/**
 * Hook to update an existing fleet
 * @returns {UseMutationResult} Mutation object with mutate function and status
 * @example
 * ```typescript
 * function EditFleetForm({ fleetId }: { fleetId: string }) {
 *   const updateFleet = useUpdateFleet()
 *   
 *   const handleSubmit = (data: UpdateFleetInput) => {
 *     updateFleet.mutate(
 *       { id: fleetId, data },
 *       {
 *         onSuccess: () => {
 *           console.log('Fleet updated successfully')
 *         }
 *       }
 *     )
 *   }
 *   
 *   return <form onSubmit={handleSubmit}>// form fields</form>
 * }
 * ```
 */
export const useUpdateFleet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFleetInput }) =>
      fleetService.updateFleet(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all })
      queryClient.invalidateQueries({ queryKey: fleetKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: fleetKeys.stats() })
    },
  })
}

/**
 * Hook to delete a fleet
 * @returns {UseMutationResult} Mutation object with mutate function and status
 * @example
 * ```typescript
 * function FleetActions({ fleetId }: { fleetId: string }) {
 *   const deleteFleet = useDeleteFleet()
 *   
 *   const handleDelete = () => {
 *     if (confirm('Are you sure?')) {
 *       deleteFleet.mutate(fleetId, {
 *         onSuccess: () => {
 *           navigate('/fleets')
 *         }
 *       })
 *     }
 *   }
 *   
 *   return (
 *     <button onClick={handleDelete} disabled={deleteFleet.isLoading}>
 *       Delete Fleet
 *     </button>
 *   )
 * }
 * ```
 */
export const useDeleteFleet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fleetService.deleteFleet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.all })
      queryClient.invalidateQueries({ queryKey: fleetKeys.stats() })
    },
  })
}

/**
 * Hook to search fleets by name or description
 * @param {string} query - Search query string
 * @returns {UseQueryResult<Fleet[]>} Query result with matching fleets
 * @example
 * ```typescript
 * function FleetSearch() {
 *   const [search, setSearch] = useState('')
 *   const { data: results, isLoading } = useSearchFleets(search)
 *   
 *   return (
 *     <div>
 *       <input
 *         value={search}
 *         onChange={(e) => setSearch(e.target.value)}
 *         placeholder="Search fleets..."
 *       />
 *       {isLoading && <Spinner />}
 *       {results?.map(fleet => (
 *         <div key={fleet.id}>{fleet.name}</div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export const useSearchFleets = (query: string) => {
  return useQuery({
    queryKey: fleetKeys.search(query),
    queryFn: () => fleetService.searchFleets(query),
    enabled: query.length > 0,
  })
}