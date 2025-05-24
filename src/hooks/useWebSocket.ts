import { useEffect, useState, useCallback, useRef } from 'react'
import { websocketService } from '../services/websocket'
import { useAuth } from '../features/auth/hooks/useAuth'
import type {
  WebSocketEvents,
  WebSocketState,
  WebSocketStatus,
  RoomSubscription,
} from '../types/websocket'

export function useWebSocket() {
  const { user, token } = useAuth()
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
    if (user && token && !hasConnected.current) {
      hasConnected.current = true
      websocketService.connect(token)
    }

    return () => {
      // Don't disconnect on unmount - let the service manage connection lifecycle
    }
  }, [user, token])

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
    if (token) {
      websocketService.connect(token)
    }
  }, [token])

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

// Hook for subscribing to specific WebSocket events
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

// Hook for tracking connection status
export function useWebSocketStatus(): WebSocketStatus {
  const { status } = useWebSocket()
  return status
}

// Hook for managing room subscriptions
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
