import React, { createContext, useContext, useEffect, useRef } from 'react'
import { websocketService } from '../services/websocket'
import { useAuth } from '../features/auth/hooks/useAuth'
import { config } from '../config'

interface WebSocketContextValue {
  isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextValue>({
  isConnected: false,
})

export const useWebSocketContext = () => useContext(WebSocketContext)

interface WebSocketProviderProps {
  children: React.ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user, token } = useAuth()
  const hasInitialized = useRef(false)
  const [isConnected, setIsConnected] = React.useState(false)

  useEffect(() => {
    // Only initialize once and only if WebSocket is enabled
    if (!config.features.websocket || hasInitialized.current) {
      return
    }

    // Connect when user is authenticated
    if (user && token) {
      console.log('[WebSocketProvider] Initializing WebSocket connection')
      hasInitialized.current = true
      websocketService.connect(token)

      // Listen for connection state changes
      const unsubscribers = [
        websocketService.on('connect', () => {
          console.log('[WebSocketProvider] Connected')
          setIsConnected(true)
        }),
        websocketService.on('disconnect', () => {
          console.log('[WebSocketProvider] Disconnected')
          setIsConnected(false)
        }),
        websocketService.on('authenticated', (data) => {
          console.log('[WebSocketProvider] Authenticated:', data.success)
        }),
        websocketService.on('unauthorized', (data) => {
          console.error('[WebSocketProvider] Unauthorized:', data.message)
        }),
      ]

      return () => {
        unsubscribers.forEach((unsub) => unsub())
      }
    } else if (!user && hasInitialized.current) {
      // Disconnect when user logs out
      console.log(
        '[WebSocketProvider] User logged out, disconnecting WebSocket',
      )
      websocketService.disconnect()
      hasInitialized.current = false
      setIsConnected(false)
    }
  }, [user, token])

  // Log WebSocket events in development
  useEffect(() => {
    if (!config.features.debugMode) return

    const unsubscribers = [
      websocketService.on('server_message', (data) => {
        console.log('[WebSocket] Server message:', data)
      }),
      websocketService.on('maintenance_mode', (data) => {
        console.log('[WebSocket] Maintenance mode:', data)
      }),
    ]

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}
