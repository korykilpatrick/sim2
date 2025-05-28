import { useEffect, useState, useCallback, useRef } from 'react'
import { websocketService } from '../services/websocket'
import { useAuth } from '../features/auth/hooks/useAuth'
import type {
  WebSocketEvents,
  WebSocketState,
  WebSocketStatus,
  RoomSubscription,
} from '../types/websocket'

/**
 * Hook for managing WebSocket connections and real-time communication
 *
 * Provides a React interface to the WebSocket service with automatic connection
 * management, authentication, and room subscriptions. Handles reconnection
 * logic and state synchronization.
 *
 * @returns {Object} WebSocket interface with connection state and methods
 * @returns {WebSocketStatus} returns.status - Current connection status
 * @returns {boolean} returns.isAuthenticated - Whether the socket is authenticated
 * @returns {number} returns.reconnectAttempts - Number of reconnection attempts
 * @returns {RoomSubscription[]} returns.rooms - Currently subscribed rooms
 * @returns {Function} returns.connect - Manually connect to WebSocket server
 * @returns {Function} returns.disconnect - Disconnect from WebSocket server
 * @returns {Function} returns.on - Subscribe to WebSocket events
 * @returns {Function} returns.off - Unsubscribe from WebSocket events
 * @returns {Function} returns.joinVesselRoom - Join a vessel-specific room
 * @returns {Function} returns.leaveVesselRoom - Leave a vessel-specific room
 * @returns {Function} returns.joinAreaRoom - Join an area-specific room
 * @returns {Function} returns.leaveAreaRoom - Leave an area-specific room
 * @returns {Function} returns.markAlertRead - Mark an alert as read
 * @returns {Function} returns.dismissAlert - Dismiss an alert
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { status, on, joinVesselRoom } = useWebSocket()
 *
 *   useEffect(() => {
 *     if (status === 'connected') {
 *       joinVesselRoom('vessel-123')
 *     }
 *   }, [status])
 *
 *   useEffect(() => {
 *     const unsubscribe = on('vessel_position_updated', (data) => {
 *       console.log('New position:', data)
 *     })
 *     return unsubscribe
 *   }, [])
 * }
 * ```
 */
export function useWebSocket() {
  const { user, isAuthenticated } = useAuth()
  const [state, setState] = useState<WebSocketState>({
    status: 'disconnected',
    isAuthenticated: false,
    reconnectAttempts: 0,
  })
  const [rooms, setRooms] = useState<RoomSubscription[]>([])

  // Track if we've initiated connection
  const hasConnected = useRef(false)

  // Update state when WebSocket state changes
  const updateState = useCallback(() => {
    const wsState = websocketService.getState()
    setState({
      status: websocketService.getStatus(),
      isAuthenticated: websocketService.getIsAuthenticated(),
      reconnectAttempts: wsState.reconnectAttempts,
    })
    setRooms(wsState.rooms)
  }, [])

  // Connect when component mounts and user is authenticated
  useEffect(() => {
    if (user && isAuthenticated && !hasConnected.current) {
      hasConnected.current = true
      websocketService.connect()
    }

    return () => {
      // Don't disconnect on unmount - let the service manage connection lifecycle
    }
  }, [user, isAuthenticated])

  // Listen for connection state changes
  useEffect(() => {
    const unsubscribers: (() => void)[] = []

    unsubscribers.push(
      websocketService.on('connect', updateState),
      websocketService.on('disconnect', updateState),
      websocketService.on('connect_error', updateState),
      websocketService.on('reconnect', updateState),
      websocketService.on('reconnect_attempt', updateState),
      websocketService.on('reconnect_failed', updateState),
      websocketService.on('authenticated', updateState),
      websocketService.on('unauthorized', updateState),
    )

    // Initial state update
    updateState()

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [updateState])

  const connect = useCallback(() => {
    websocketService.connect()
  }, [])

  const disconnect = useCallback(() => {
    websocketService.disconnect()
    hasConnected.current = false
  }, [])

  const on = useCallback(
    <K extends keyof WebSocketEvents>(
      event: K,
      handler: WebSocketEvents[K],
    ) => {
      return websocketService.on(event, handler)
    },
    [],
  )

  const off = useCallback(
    <K extends keyof WebSocketEvents>(
      event: K,
      handler?: WebSocketEvents[K],
    ) => {
      websocketService.off(event, handler)
    },
    [],
  )

  const joinVesselRoom = useCallback(
    (vesselId: string) => {
      websocketService.joinVesselRoom(vesselId)
      updateState()
    },
    [updateState],
  )

  const leaveVesselRoom = useCallback(
    (vesselId: string) => {
      websocketService.leaveVesselRoom(vesselId)
      updateState()
    },
    [updateState],
  )

  const joinAreaRoom = useCallback(
    (areaId: string) => {
      websocketService.joinAreaRoom(areaId)
      updateState()
    },
    [updateState],
  )

  const leaveAreaRoom = useCallback(
    (areaId: string) => {
      websocketService.leaveAreaRoom(areaId)
      updateState()
    },
    [updateState],
  )

  const markAlertRead = useCallback((alertId: string) => {
    websocketService.markAlertRead(alertId)
  }, [])

  const dismissAlert = useCallback((alertId: string) => {
    websocketService.dismissAlert(alertId)
  }, [])

  return {
    ...state,
    rooms,
    connect,
    disconnect,
    on,
    off,
    joinVesselRoom,
    leaveVesselRoom,
    joinAreaRoom,
    leaveAreaRoom,
    markAlertRead,
    dismissAlert,
  }
}

/**
 * Hook for subscribing to specific WebSocket events with automatic cleanup
 *
 * Simplifies event subscription by handling the subscription lifecycle automatically.
 * The event handler will be re-subscribed whenever dependencies change.
 *
 * @template K - The event type from WebSocketEvents
 * @param {K} event - The event name to subscribe to
 * @param {WebSocketEvents[K]} handler - The event handler function
 * @param {React.DependencyList} deps - Dependencies that trigger re-subscription when changed
 *
 * @example
 * ```typescript
 * function VesselTracker({ vesselId }: { vesselId: string }) {
 *   const [position, setPosition] = useState(null)
 *
 *   useWebSocketEvent('vessel_position_updated', (data) => {
 *     if (data.vesselId === vesselId) {
 *       setPosition(data.position)
 *     }
 *   }, [vesselId])
 *
 *   return <div>Position: {position?.lat}, {position?.lng}</div>
 * }
 * ```
 */
export function useWebSocketEvent<K extends keyof WebSocketEvents>(
  event: K,
  handler: WebSocketEvents[K],
  deps: React.DependencyList = [],
) {
  const { on } = useWebSocket()

  useEffect(() => {
    const unsubscribe = on(event, handler)
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps])
}

/**
 * Hook for tracking WebSocket connection status
 *
 * A lightweight hook that only subscribes to connection status changes,
 * useful when you only need to monitor connection state.
 *
 * @returns {WebSocketStatus} The current connection status
 *
 * @example
 * ```typescript
 * function ConnectionIndicator() {
 *   const status = useWebSocketStatus()
 *
 *   return (
 *     <div className={status === 'connected' ? 'text-green' : 'text-red'}>
 *       {status === 'connected' ? 'Connected' : 'Disconnected'}
 *     </div>
 *   )
 * }
 * ```
 */
export function useWebSocketStatus(): WebSocketStatus {
  const { status } = useWebSocket()
  return status
}

/**
 * Hook for managing room subscriptions with automatic lifecycle management
 *
 * Automatically joins a room when the component mounts and leaves when it unmounts.
 * Handles authentication state and conditional enabling.
 *
 * @param {'vessel' | 'area'} type - The type of room to join
 * @param {string | null} id - The ID of the vessel or area (null to skip)
 * @param {boolean} enabled - Whether the subscription should be active (default: true)
 *
 * @example
 * ```typescript
 * function VesselMonitor({ vesselId }: { vesselId: string }) {
 *   // Automatically join/leave vessel room
 *   useWebSocketRoom('vessel', vesselId)
 *
 *   // Handle vessel updates
 *   useWebSocketEvent('vessel_position_updated', (data) => {
 *     console.log('Vessel updated:', data)
 *   })
 *
 *   return <div>Monitoring vessel {vesselId}</div>
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Conditionally subscribe based on user preferences
 * function AreaMonitor({ areaId, autoRefresh }: Props) {
 *   useWebSocketRoom('area', areaId, autoRefresh)
 *
 *   return <div>Area monitoring {autoRefresh ? 'enabled' : 'disabled'}</div>
 * }
 * ```
 */
export function useWebSocketRoom(
  type: 'vessel' | 'area',
  id: string | null,
  enabled = true,
) {
  const {
    joinVesselRoom,
    leaveVesselRoom,
    joinAreaRoom,
    leaveAreaRoom,
    isAuthenticated,
  } = useWebSocket()

  useEffect(() => {
    if (!enabled || !id || !isAuthenticated) return

    if (type === 'vessel') {
      joinVesselRoom(id)
      return () => leaveVesselRoom(id)
    } else {
      joinAreaRoom(id)
      return () => leaveAreaRoom(id)
    }
  }, [
    type,
    id,
    enabled,
    isAuthenticated,
    joinVesselRoom,
    leaveVesselRoom,
    joinAreaRoom,
    leaveAreaRoom,
  ])
}
