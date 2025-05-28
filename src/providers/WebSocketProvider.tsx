import React, { useEffect, useRef } from 'react'
import { websocketService } from '../services/websocket'
import { useAuth } from '../features/auth/hooks/useAuth'
import { config } from '../config'
import { createLogger } from '../services/logger'
import { WebSocketContext } from './WebSocketContext'

const logger = createLogger('WebSocketProvider')

interface WebSocketProviderProps {
  children: React.ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user, isAuthenticated } = useAuth()
  const hasInitialized = useRef(false)
  const [isConnected, setIsConnected] = React.useState(false)

  useEffect(() => {
    // Only initialize once and only if WebSocket is enabled
    if (!config.features.websocket || hasInitialized.current) {
      return
    }

    // Connect when user is authenticated
    if (user && isAuthenticated) {
      logger.info('Initializing WebSocket connection')
      hasInitialized.current = true
      websocketService.connect()

      // Listen for connection state changes
      const unsubscribers = [
        websocketService.on('connect', () => {
          logger.info('Connected')
          setIsConnected(true)
        }),
        websocketService.on('disconnect', () => {
          logger.info('Disconnected')
          setIsConnected(false)
        }),
        websocketService.on('authenticated', (data) => {
          logger.info('Authenticated:', data.success)
        }),
        websocketService.on('unauthorized', (data) => {
          logger.error('Unauthorized:', data.message)
        }),
      ]

      return () => {
        unsubscribers.forEach((unsub) => unsub())
      }
    } else if (!user && hasInitialized.current) {
      // Disconnect when user logs out
      logger.info('User logged out, disconnecting WebSocket')
      websocketService.disconnect()
      hasInitialized.current = false
      setIsConnected(false)
    }
  }, [user, isAuthenticated])

  // Log WebSocket events in development
  useEffect(() => {
    if (!config.features.debugMode) return

    const unsubscribers = [
      websocketService.on('server_message', (data) => {
        logger.debug('Server message:', data)
      }),
      websocketService.on('maintenance_mode', (data) => {
        logger.debug('Maintenance mode:', data)
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
