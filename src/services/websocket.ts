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

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

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

  authenticate(token: string): void {
    if (!this.socket?.connected) {
      logger.error('Cannot authenticate: not connected')
      return
    }

    this.authToken = token
    this.socket.emit('authenticate', token)
  }

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

  on<K extends keyof WebSocketEvents>(
    event: K,
    handler: WebSocketEvents[K],
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    this.listeners.get(event)!.add(handler)

    // Return unsubscribe function
    return () => {
      const handlers = this.listeners.get(event)
      if (handlers) {
        handlers.delete(handler)
      }
    }
  }

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
        handlers.delete(handler)
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

  getStatus(): WebSocketStatus {
    return this.status
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getIsAuthenticated(): boolean {
    return this.isAuthenticated
  }

  getRooms(): RoomSubscription[] {
    return Array.from(this.rooms.values())
  }

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
