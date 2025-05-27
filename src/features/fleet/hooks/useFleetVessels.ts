import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fleetService } from '../services/fleetService'
import type {
  AddVesselToFleetInput,
  RemoveVesselFromFleetInput,
} from '../types'
import { fleetKeys } from './'

/**
 * Hook for fetching vessels in a fleet
 * 
 * Retrieves all vessels assigned to a specific fleet. Results include vessel
 * details, current status, and position information.
 * 
 * @param {string} fleetId - The ID of the fleet
 * @returns {UseQueryResult} Query result with vessels array
 * 
 * @example
 * ```typescript
 * function FleetVesselsList({ fleetId }: { fleetId: string }) {
 *   const { data: vessels, isLoading } = useFleetVessels(fleetId)
 *   
 *   if (isLoading) return <Spinner />
 *   
 *   return (
 *     <div>
 *       <h3>Fleet Vessels ({vessels?.length || 0})</h3>
 *       {vessels?.map(vessel => (
 *         <VesselCard key={vessel.id} vessel={vessel} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export const useFleetVessels = (fleetId: string) => {
  return useQuery({
    queryKey: fleetKeys.vessels(fleetId),
    queryFn: () => fleetService.getFleetVessels(fleetId),
    enabled: !!fleetId,
  })
}

/**
 * Hook for adding a vessel to a fleet
 * 
 * Assigns a vessel to a fleet. Automatically invalidates related queries to
 * update the UI with the new vessel assignment.
 * 
 * @returns {UseMutationResult} Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * function AddVesselButton({ fleetId }: { fleetId: string }) {
 *   const addVessel = useAddVesselToFleet()
 *   const [selectedVesselId, setSelectedVesselId] = useState('')
 *   
 *   const handleAdd = () => {
 *     addVessel.mutate(
 *       { fleetId, vesselId: selectedVesselId },
 *       {
 *         onSuccess: () => {
 *           showToast({ type: 'success', message: 'Vessel added to fleet' })
 *           setSelectedVesselId('')
 *         },
 *         onError: (error) => {
 *           showToast({ type: 'error', message: error.message })
 *         }
 *       }
 *     )
 *   }
 *   
 *   return (
 *     <div>
 *       <VesselSelect
 *         value={selectedVesselId}
 *         onChange={setSelectedVesselId}
 *       />
 *       <button
 *         onClick={handleAdd}
 *         disabled={!selectedVesselId || addVessel.isPending}
 *       >
 *         {addVessel.isPending ? 'Adding...' : 'Add to Fleet'}
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export const useAddVesselToFleet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddVesselToFleetInput) =>
      fleetService.addVesselToFleet(data),
    onSuccess: (_, { fleetId }) => {
      queryClient.invalidateQueries({
        queryKey: fleetKeys.vessels(fleetId),
      })
      queryClient.invalidateQueries({ queryKey: fleetKeys.stats() })
      queryClient.invalidateQueries({ queryKey: fleetKeys.detail(fleetId) })
    },
  })
}

/**
 * Hook for removing a vessel from a fleet
 * 
 * Unassigns a vessel from a fleet. Automatically invalidates related queries
 * to update the UI after removal.
 * 
 * @returns {UseMutationResult} Mutation object with mutate function
 * 
 * @example
 * ```typescript
 * function RemoveVesselButton({ fleetId, vesselId }: Props) {
 *   const removeVessel = useRemoveVesselFromFleet()
 *   const [showConfirm, setShowConfirm] = useState(false)
 *   
 *   const handleRemove = () => {
 *     removeVessel.mutate(
 *       { fleetId, vesselId },
 *       {
 *         onSuccess: () => {
 *           showToast({ type: 'success', message: 'Vessel removed from fleet' })
 *           setShowConfirm(false)
 *         }
 *       }
 *     )
 *   }
 *   
 *   return (
 *     <>
 *       <button onClick={() => setShowConfirm(true)}>
 *         Remove from Fleet
 *       </button>
 *       
 *       {showConfirm && (
 *         <ConfirmDialog
 *           title="Remove Vessel?"
 *           message="Are you sure you want to remove this vessel from the fleet?"
 *           onConfirm={handleRemove}
 *           onCancel={() => setShowConfirm(false)}
 *           confirmText={removeVessel.isPending ? 'Removing...' : 'Remove'}
 *           disabled={removeVessel.isPending}
 *         />
 *       )}
 *     </>
 *   )
 * }
 * ```
 */
export const useRemoveVesselFromFleet = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RemoveVesselFromFleetInput) =>
      fleetService.removeVesselFromFleet(data),
    onSuccess: (_, { fleetId }) => {
      queryClient.invalidateQueries({
        queryKey: fleetKeys.vessels(fleetId),
      })
      queryClient.invalidateQueries({ queryKey: fleetKeys.stats() })
      queryClient.invalidateQueries({ queryKey: fleetKeys.detail(fleetId) })
    },
  })
}

/**
 * Hook for searching vessels within a fleet
 * 
 * Searches for vessels in a fleet by name, IMO, or MMSI. Only triggers search
 * when query is not empty.
 * 
 * @param {string} fleetId - The ID of the fleet to search within
 * @param {string} query - Search query (vessel name, IMO, or MMSI)
 * @returns {UseQueryResult} Query result with matching vessels
 * 
 * @example
 * ```typescript
 * function FleetVesselSearch({ fleetId }: { fleetId: string }) {
 *   const [searchQuery, setSearchQuery] = useState('')
 *   const { data: results, isLoading } = useSearchFleetVessels(fleetId, searchQuery)
 *   
 *   return (
 *     <div>
 *       <input
 *         type="text"
 *         value={searchQuery}
 *         onChange={(e) => setSearchQuery(e.target.value)}
 *         placeholder="Search fleet vessels..."
 *       />
 *       
 *       {isLoading && <Spinner />}
 *       
 *       {results?.map(vessel => (
 *         <div key={vessel.id}>
 *           {vessel.name} (IMO: {vessel.imo})
 *         </div>
 *       ))}
 *       
 *       {searchQuery && results?.length === 0 && (
 *         <p>No vessels found matching "{searchQuery}"</p>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export const useSearchFleetVessels = (fleetId: string, query: string) => {
  return useQuery({
    queryKey: fleetKeys.vesselSearch(fleetId, query),
    queryFn: () => fleetService.searchFleetVessels(fleetId, query),
    enabled: !!fleetId && query.length > 0,
  })
}
