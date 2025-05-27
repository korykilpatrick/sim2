import { io, Socket } from 'socket.io-client'
import { config } from '../config'
import { createLogger } from './logger'
import type {
  WebSocketEvents,
  WebSocketEmitEvents,
  WebSocketStatus,
  RoomSubscription,
} from '../types/websocket'

const logger = createLogger('WebSocket')

/**
 * Singleton service for managing WebSocket connections
 * Handles authentication, room subscriptions, and real-time event handling
 * 
 * @class WebSocketService
 * @example
 * ```typescript
 * const ws = WebSocketService.getInstance()
 * 
 * // Connect with authentication
 * ws.connect(authToken)
 * 
 * // Subscribe to events
 * ws.on('credit_balance_updated', (data) => {
 *   console.log('New balance:', data.balance)
 * })
 * 
 * // Join a room for real-time updates
 * ws.joinRoom('vessel_123_tracking')
 * ```
 */
export class WebSocketService {
  private socket: Socket<WebSocketEvents, WebSocketEmitEvents> | null = null
  private status: WebSocketStatus = 'disconnected'
  private isAuthenticated = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<keyof WebSocketEvents, Set<(...args: unknown[]) => void>> =
    new Map()
  private rooms: Map<string, RoomSubscription> = new Map()
  private authToken: string | null = null

  private static instance: WebSocketService

  private constructor() {}

  /**
   * Gets the singleton instance of WebSocketService
   * @returns {WebSocketService} The WebSocket service instance
   */
  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  /**
   * Establishes a WebSocket connection
   * @param {string} [token] - Optional authentication token
   * @returns {void}
   * @example
   * ```typescript
   * // Connect without authentication
   * ws.connect()
   * 
   * // Connect with authentication
   * ws.connect(userAuthToken)
   * ```
   */
  connect(token?: string): void {
    if (this.socket?.connected) {
      logger.debug('Already connected')
      return
    }

    if (!config.features.websocket) {
      logger.debug('Feature disabled')
      return
    }

    logger.debug('Connecting to', config.websocketUrl)
    this.authToken = token || null
    this.status = 'connecting'

    this.socket = io(config.websocketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 10000,
      auth: token ? { token } : undefined,
    })

    this.setupEventHandlers()
  }

  /**
   * Disconnects from the WebSocket server
   * Clears all room subscriptions and event listeners
   * @returns {void}
   * @example
   * ```typescript
   * // Disconnect when user logs out
   * ws.disconnect()
   * ```
   */
  disconnect(): void {
    if (!this.socket) return

    logger.debug('Disconnecting')
    this.rooms.clear()
    this.socket.disconnect()
    this.socket = null
    this.status = 'disconnected'
    this.isAuthenticated = false
  }

  private setupEventHandlers(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      logger.info('Connected')
      this.status = 'connected'
      this.reconnectAttempts = 0
      this.emit('connect')

      // Re-authenticate if we have a token
      if (this.authToken) {
        this.authenticate(this.authToken)
      }

      // Rejoin rooms after reconnection
      this.rejoinRooms()
    })

    this.socket.on('disconnect', (reason) => {
      logger.info('Disconnected:', reason)
      this.status = 'disconnected'
      this.isAuthenticated = false
      this.emit('disconnect', reason)
    })

    this.socket.on('connect_error', (error) => {
      logger.error('Connection error:', error.message)
      this.status = 'error'
      this.emit('connect_error', error)
    })

    this.socket.io.on('reconnect_attempt', (attempt) => {
      logger.debug('Reconnection attempt', attempt)
      this.status = 'reconnecting'
      this.reconnectAttempts = attempt
      this.emit('reconnect_attempt', attempt)
    })

    this.socket.io.on('reconnect', (attempt) => {
      logger.info('Reconnected after', { attempts: attempt })
      this.emit('reconnect', attempt)
    })

    this.socket.io.on('reconnect_error', (error) => {
      logger.error('Reconnection error:', error.message)
      this.emit('reconnect_error', error)
    })

    this.socket.io.on('reconnect_failed', () => {
      logger.error('Reconnection failed')
      this.status = 'error'
      this.emit('reconnect_failed')
    })

    // Authentication events
    this.socket.on('authenticated', (data) => {
      logger.info('Authenticated:', data.success)
      this.isAuthenticated = data.success
      this.emit('authenticated', data)
    })

    this.socket.on('unauthorized', (data) => {
      logger.error('Unauthorized:', data.message)
      this.isAuthenticated = false
      this.emit('unauthorized', data)
    })

    // Register all other event handlers
    const events: (keyof WebSocketEvents)[] = [
      'vessel_position_update',
      'vessel_status_change',
      'vessel_tracking_started',
      'vessel_tracking_stopped',
      'area_alert',
      'area_vessel_entered',
      'area_vessel_exited',
      'area_monitoring_started',
      'area_monitoring_stopped',
      'alert_created',
      'alert_updated',
      'alert_dismissed',
      'credit_balance_updated',
      'credit_low_balance',
      'server_message',
      'maintenance_mode',
    ]

    events.forEach((event) => {
      this.socket!.on(event as keyof WebSocketEvents, (data: unknown) => {
        this.emit(event as keyof WebSocketEvents, data as never)
      })
    })
  }

  private rejoinRooms(): void {
    this.rooms.forEach((subscription) => {
      if (subscription.type === 'vessel') {
        this.joinVesselRoom(subscription.room)
      } else if (subscription.type === 'area') {
        this.joinAreaRoom(subscription.room)
      }
    })
  }

  /**
   * Authenticates the WebSocket connection with a token
   * @param {string} token - Authentication token
   * @returns {void}
   * @example
   * ```typescript
   * // Authenticate after connection
   * ws.on('connect', () => {
   *   ws.authenticate(authToken)
   * })
   * ```
   */
  authenticate(token: string): void {
    if (!this.socket?.connected) {
      logger.error('Cannot authenticate: not connected')
      return
    }

    this.authToken = token
    this.socket.emit('authenticate', token)
  }

  /**
   * Joins a vessel-specific room for real-time updates
   * @param {string} vesselId - The vessel ID to track
   * @returns {void}
   * @example
   * ```typescript
   * // Track a specific vessel
   * ws.joinVesselRoom('vessel-123')
   * 
   * // Listen for position updates
   * ws.on('vessel_position_update', (data) => {
   *   console.log('New position:', data.position)
   * })
   * ```
   */
  joinVesselRoom(vesselId: string): void {
    if (!this.socket?.connected || !this.isAuthenticated) {
      logger.error('Cannot join room: not connected or not authenticated')
      return
    }

    const roomName = `vessel:${vesselId}`
    if (this.rooms.has(roomName)) {
      logger.debug('Already in vessel room:', vesselId)
      return
    }

    this.socket.emit('join_vessel_room', vesselId)
    this.rooms.set(roomName, {
      room: vesselId,
      type: 'vessel',
      joinedAt: new Date().toISOString(),
    })
    logger.debug('Joined vessel room:', vesselId)
  }

  /**
   * Leaves a vessel-specific room
   * @param {string} vesselId - The vessel ID to stop tracking
   * @returns {void}
   * @example
   * ```typescript
   * // Stop tracking a vessel
   * ws.leaveVesselRoom('vessel-123')
   * ```
   */
  leaveVesselRoom(vesselId: string): void {
    if (!this.socket?.connected) return

    const roomName = `vessel:${vesselId}`
    if (!this.rooms.has(roomName)) {
      logger.debug('Not in vessel room:', vesselId)
      return
    }

    this.socket.emit('leave_vessel_room', vesselId)
    this.rooms.delete(roomName)
    logger.debug('Left vessel room:', vesselId)
  }

  joinAreaRoom(areaId: string): void {
    if (!this.socket?.connected || !this.isAuthenticated) {
      logger.error('Cannot join room: not connected or not authenticated')
      return
    }

    const roomName = `area:${areaId}`
    if (this.rooms.has(roomName)) {
      logger.debug('Already in area room:', areaId)
      return
    }

    this.socket.emit('join_area_room', areaId)
    this.rooms.set(roomName, {
      room: areaId,
      type: 'area',
      joinedAt: new Date().toISOString(),
    })
    logger.debug('Joined area room:', areaId)
  }

  leaveAreaRoom(areaId: string): void {
    if (!this.socket?.connected) return

    const roomName = `area:${areaId}`
    if (!this.rooms.has(roomName)) {
      logger.debug('Not in area room:', areaId)
      return
    }

    this.socket.emit('leave_area_room', areaId)
    this.rooms.delete(roomName)
    logger.debug('Left area room:', areaId)
  }

  markAlertRead(alertId: string): void {
    if (!this.socket?.connected || !this.isAuthenticated) return
    this.socket.emit('mark_alert_read', alertId)
  }

  dismissAlert(alertId: string): void {
    if (!this.socket?.connected || !this.isAuthenticated) return
    this.socket.emit('dismiss_alert', alertId)
  }

  /**
   * Subscribes to a WebSocket event
   * @template K - The event type
   * @param {K} event - Event name to subscribe to
   * @param {WebSocketEvents[K]} handler - Event handler function
   * @returns {Function} Unsubscribe function
   * @example
   * ```typescript
   * // Subscribe to credit balance updates
   * const unsubscribe = ws.on('credit_balance_updated', (data) => {
   *   console.log('New balance:', data.balance.available)
   * })
   * 
   * // Later, unsubscribe
   * unsubscribe()
   * ```
   */
  on<K extends keyof WebSocketEvents>(
    event: K,
    handler: WebSocketEvents[K],
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(handler as (...args: unknown[]) => void)

    // Return unsubscribe function
    return () => {
      const handlers = this.listeners.get(event)
      if (handlers) {
        handlers.delete(handler as (...args: unknown[]) => void)
      }
    }
  }

  /**
   * Unsubscribes from a WebSocket event
   * @template K - The event type
   * @param {K} event - Event name to unsubscribe from
   * @param {WebSocketEvents[K]} [handler] - Specific handler to remove (removes all if not provided)
   * @returns {void}
   * @example
   * ```typescript
   * // Remove specific handler
   * ws.off('vessel_position_update', myHandler)
   * 
   * // Remove all handlers for an event
   * ws.off('vessel_position_update')
   * ```
   */
  off<K extends keyof WebSocketEvents>(
    event: K,
    handler?: WebSocketEvents[K],
  ): void {
    if (!handler) {
      // Remove all handlers for this event
      this.listeners.delete(event)
    } else {
      // Remove specific handler
      const handlers = this.listeners.get(event)
      if (handlers) {
        handlers.delete(handler as (...args: unknown[]) => void)
      }
    }
  }

  private emit<K extends keyof WebSocketEvents>(
    event: K,
    ...args: Parameters<WebSocketEvents[K]>
  ): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(...args)
        } catch (error) {
          logger.error(`Error in ${event} handler:`, error)
        }
      })
    }
  }

  /**
   * Gets the current connection status
   * @returns {WebSocketStatus} Connection status ('disconnected' | 'connecting' | 'connected')
   */
  getStatus(): WebSocketStatus {
    return this.status
  }

  /**
   * Checks if the WebSocket is connected
   * @returns {boolean} True if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * Checks if the connection is authenticated
   * @returns {boolean} True if authenticated
   */
  getIsAuthenticated(): boolean {
    return this.isAuthenticated
  }

  /**
   * Gets all active room subscriptions
   * @returns {RoomSubscription[]} Array of room subscriptions
   */
  getRooms(): RoomSubscription[] {
    return Array.from(this.rooms.values())
  }

  /**
   * Gets the complete WebSocket state
   * @returns {Object} Current state including status, authentication, and rooms
   */
  getState() {
    return {
      status: this.status,
      isAuthenticated: this.isAuthenticated,
      reconnectAttempts: this.reconnectAttempts,
      rooms: this.getRooms(),
    }
  }
}

// Export the enhanced service as the default
import { enhancedWebSocketService } from './websocket-enhanced'
export const websocketService = enhancedWebSocketService as unknown as WebSocketService
