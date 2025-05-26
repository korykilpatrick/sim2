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

// Operation types for queuing
interface QueuedOperation {
  type: 'join_vessel' | 'join_area' | 'leave_vessel' | 'leave_area' | 'mark_alert_read' | 'dismiss_alert'
  payload: string
  timestamp: number
  retries: number
}

// Enhanced state machine states
type ConnectionState = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'authenticating'
  | 'authenticated'
  | 'reconnecting'
  | 'error'

// Backoff strategy configuration
interface BackoffConfig {
  initialDelay: number
  maxDelay: number
  multiplier: number
  jitter: boolean
}

export class EnhancedWebSocketService {
  private socket: Socket<WebSocketEvents, WebSocketEmitEvents> | null = null
  private connectionState: ConnectionState = 'disconnected'
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private listeners: Map<keyof WebSocketEvents, Set<(...args: unknown[]) => void>> = new Map()
  private rooms: Map<string, RoomSubscription> = new Map()
  private authToken: string | null = null
  
  // Operation queue for handling operations before auth
  private operationQueue: QueuedOperation[] = []
  private isProcessingQueue = false
  
  // Backoff strategy for auth retries
  private authRetryCount = 0
  private authRetryTimer: NodeJS.Timeout | null = null
  private authBackoffConfig: BackoffConfig = {
    initialDelay: 1000,
    maxDelay: 30000,
    multiplier: 2,
    jitter: true,
  }
  
  // Backoff for room operations
  private roomRetryTimers: Map<string, NodeJS.Timeout> = new Map()
  private roomRetryBackoffConfig: BackoffConfig = {
    initialDelay: 500,
    maxDelay: 10000,
    multiplier: 1.5,
    jitter: true,
  }

  private static instance: EnhancedWebSocketService

  private constructor() {}

  static getInstance(): EnhancedWebSocketService {
    if (!EnhancedWebSocketService.instance) {
      EnhancedWebSocketService.instance = new EnhancedWebSocketService()
    }
    return EnhancedWebSocketService.instance
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
    this.transitionState('connecting')

    this.socket = io(config.websocketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      auth: token ? { token } : undefined,
    })

    this.setupEventHandlers()
  }

  disconnect(): void {
    if (!this.socket) return

    logger.debug('Disconnecting')
    
    // Clear all timers
    this.clearAllTimers()
    
    // Clear queues and state
    this.operationQueue = []
    this.rooms.clear()
    this.authRetryCount = 0
    
    // Disconnect socket
    this.socket.disconnect()
    this.socket = null
    this.transitionState('disconnected')
  }

  private clearAllTimers(): void {
    if (this.authRetryTimer) {
      clearTimeout(this.authRetryTimer)
      this.authRetryTimer = null
    }
    
    this.roomRetryTimers.forEach((timer) => clearTimeout(timer))
    this.roomRetryTimers.clear()
  }

  private transitionState(newState: ConnectionState): void {
    const oldState = this.connectionState
    this.connectionState = newState
    
    logger.debug(`State transition: ${oldState} -> ${newState}`)
    
    // Handle state-specific logic
    switch (newState) {
      case 'authenticated':
        this.processQueuedOperations()
        this.authRetryCount = 0
        break
      case 'disconnected':
      case 'error':
        this.clearAllTimers()
        break
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      logger.info('Connected')
      this.transitionState('connected')
      this.reconnectAttempts = 0
      this.emit('connect')

      // Start authentication if we have a token
      if (this.authToken) {
        this.authenticate(this.authToken)
      }
    })

    this.socket.on('disconnect', (reason) => {
      logger.info('Disconnected:', reason)
      // Don't clear rooms on disconnect - we'll rejoin them on reconnect
      this.transitionState('disconnected')
      this.emit('disconnect', reason)
    })

    this.socket.on('connect_error', (error) => {
      logger.error('Connection error:', error.message)
      this.transitionState('error')
      this.emit('connect_error', error)
    })

    this.socket.io.on('reconnect_attempt', (attempt) => {
      logger.debug('Reconnection attempt', attempt)
      this.transitionState('reconnecting')
      this.reconnectAttempts = attempt
      this.emit('reconnect_attempt', attempt)
    })

    this.socket.io.on('reconnect', (attempt) => {
      logger.info('Reconnected after', { attempts: attempt })
      this.transitionState('connected')
      this.emit('reconnect', attempt)
      
      // Re-authenticate after reconnection
      if (this.authToken) {
        this.authenticate(this.authToken)
      }
    })

    this.socket.io.on('reconnect_error', (error) => {
      logger.error('Reconnection error:', error.message)
      this.emit('reconnect_error', error)
    })

    this.socket.io.on('reconnect_failed', () => {
      logger.error('Reconnection failed')
      this.transitionState('error')
      this.emit('reconnect_failed')
    })

    // Authentication events
    this.socket.on('authenticated', (data) => {
      logger.info('Authenticated:', data.success)
      if (data.success) {
        this.transitionState('authenticated')
        this.emit('authenticated', data)
      } else {
        this.handleAuthFailure({ message: 'Authentication failed' })
      }
    })

    this.socket.on('unauthorized', (data) => {
      logger.error('Unauthorized:', data.message)
      this.handleAuthFailure(data)
      this.emit('unauthorized', data)
    })

    // Room join/leave confirmations
    this.socket.on('room_joined' as keyof WebSocketEvents, (data: { room: string; type: 'vessel' | 'area' }) => {
      logger.debug(`Successfully joined ${data.type} room:`, data.room)
      this.clearRoomRetryTimer(`${data.type}:${data.room}`)
    })

    this.socket.on('room_join_error' as keyof WebSocketEvents, (data: { room: string; error: string }) => {
      logger.error('Room join error:', data.error)
      this.handleRoomJoinError(data.room, data.error)
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
        this.emit(event, data)
      })
    })
  }

  private handleAuthFailure(_data: { message: string }): void {
    // Update state but remain connected
    if (this.connectionState === 'authenticated') {
      this.transitionState('connected')
    }
    
    // Schedule retry with backoff
    this.scheduleAuthRetry()
  }

  private scheduleAuthRetry(): void {
    if (!this.authToken || this.authRetryTimer) return
    
    const delay = this.calculateBackoffDelay(
      this.authRetryCount,
      this.authBackoffConfig
    )
    
    logger.debug(`Scheduling auth retry in ${delay}ms (attempt ${this.authRetryCount + 1})`)
    
    this.authRetryTimer = setTimeout(() => {
      this.authRetryTimer = null
      this.authRetryCount++
      if (this.socket?.connected && this.authToken) {
        this.authenticate(this.authToken)
      }
    }, delay)
  }

  private calculateBackoffDelay(attemptCount: number, config: BackoffConfig): number {
    let delay = Math.min(
      config.initialDelay * Math.pow(config.multiplier, attemptCount),
      config.maxDelay
    )
    
    if (config.jitter) {
      // Add random jitter (±25%)
      const jitter = delay * 0.25 * (Math.random() - 0.5) * 2
      delay += jitter
    }
    
    return Math.round(delay)
  }

  authenticate(token: string): void {
    if (!this.socket?.connected) {
      logger.error('Cannot authenticate: not connected')
      return
    }

    logger.debug('Authenticating...')
    this.authToken = token
    this.transitionState('authenticating')
    this.socket.emit('authenticate', token)
  }

  private queueOperation(operation: QueuedOperation): void {
    // Check if operation already exists in queue
    const existingIndex = this.operationQueue.findIndex(
      (op) => op.type === operation.type && op.payload === operation.payload
    )
    
    if (existingIndex === -1) {
      this.operationQueue.push(operation)
      logger.debug(`Queued operation: ${operation.type} ${operation.payload}`)
    }
  }

  private async processQueuedOperations(): Promise<void> {
    if (this.isProcessingQueue) return
    
    this.isProcessingQueue = true
    
    // Process queued operations if any
    if (this.operationQueue.length > 0) {
      logger.debug(`Processing ${this.operationQueue.length} queued operations`)
      
      // Process operations in order
      while (this.operationQueue.length > 0) {
        const operation = this.operationQueue.shift()!
        
        switch (operation.type) {
          case 'join_vessel':
            this.joinVesselRoom(operation.payload, true)
            break
          case 'join_area':
            this.joinAreaRoom(operation.payload, true)
            break
          case 'leave_vessel':
            this.leaveVesselRoom(operation.payload)
            break
          case 'leave_area':
            this.leaveAreaRoom(operation.payload)
            break
          case 'mark_alert_read':
            this.markAlertRead(operation.payload, true)
            break
          case 'dismiss_alert':
            this.dismissAlert(operation.payload, true)
            break
        }
        
        // Small delay between operations to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }
    
    this.isProcessingQueue = false
    
    // Always rejoin existing rooms after authentication
    this.rejoinRooms()
  }

  private rejoinRooms(): void {
    if (this.connectionState !== 'authenticated') {
      logger.debug('Cannot rejoin rooms: not authenticated')
      return
    }
    
    logger.debug(`Rejoining ${this.rooms.size} rooms`)
    this.rooms.forEach((subscription) => {
      if (subscription.type === 'vessel') {
        this.socket?.emit('join_vessel_room', subscription.room)
      } else if (subscription.type === 'area') {
        this.socket?.emit('join_area_room', subscription.room)
      }
    })
  }

  joinVesselRoom(vesselId: string, fromQueue = false): void {
    const roomName = `vessel:${vesselId}`
    
    // If not authenticated, queue the operation
    if (this.connectionState !== 'authenticated' && !fromQueue) {
      this.queueOperation({
        type: 'join_vessel',
        payload: vesselId,
        timestamp: Date.now(),
        retries: 0,
      })
      return
    }
    
    if (!this.socket?.connected) {
      logger.error('Cannot join room: not connected')
      return
    }
    
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
    this.clearRoomRetryTimer(roomName)
    logger.debug('Left vessel room:', vesselId)
  }

  joinAreaRoom(areaId: string, fromQueue = false): void {
    const roomName = `area:${areaId}`
    
    // If not authenticated, queue the operation
    if (this.connectionState !== 'authenticated' && !fromQueue) {
      this.queueOperation({
        type: 'join_area',
        payload: areaId,
        timestamp: Date.now(),
        retries: 0,
      })
      return
    }
    
    if (!this.socket?.connected) {
      logger.error('Cannot join room: not connected')
      return
    }
    
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
    this.clearRoomRetryTimer(roomName)
    logger.debug('Left area room:', areaId)
  }

  private handleRoomJoinError(room: string, _error: string): void {
    const [type, id] = room.split(':')
    const retryCount = this.getRoomRetryCount(room)
    
    if (retryCount >= 3) {
      logger.error(`Max retries reached for room ${room}`)
      return
    }
    
    const delay = this.calculateBackoffDelay(retryCount, this.roomRetryBackoffConfig)
    logger.debug(`Retrying room join for ${room} in ${delay}ms`)
    
    const timer = setTimeout(() => {
      this.roomRetryTimers.delete(room)
      if (type === 'vessel') {
        this.joinVesselRoom(id, true)
      } else if (type === 'area') {
        this.joinAreaRoom(id, true)
      }
    }, delay)
    
    this.roomRetryTimers.set(room, timer)
  }

  private getRoomRetryCount(room: string): number {
    // Simple counter based on timer existence
    return this.roomRetryTimers.has(room) ? 1 : 0
  }

  private clearRoomRetryTimer(room: string): void {
    const timer = this.roomRetryTimers.get(room)
    if (timer) {
      clearTimeout(timer)
      this.roomRetryTimers.delete(room)
    }
  }

  markAlertRead(alertId: string, fromQueue = false): void {
    if (this.connectionState !== 'authenticated' && !fromQueue) {
      this.queueOperation({
        type: 'mark_alert_read',
        payload: alertId,
        timestamp: Date.now(),
        retries: 0,
      })
      return
    }
    
    if (!this.socket?.connected) return
    this.socket.emit('mark_alert_read', alertId)
  }

  dismissAlert(alertId: string, fromQueue = false): void {
    if (this.connectionState !== 'authenticated' && !fromQueue) {
      this.queueOperation({
        type: 'dismiss_alert',
        payload: alertId,
        timestamp: Date.now(),
        retries: 0,
      })
      return
    }
    
    if (!this.socket?.connected) return
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

  // Getters for backwards compatibility
  getStatus(): WebSocketStatus {
    // Map enhanced states to original states
    switch (this.connectionState) {
      case 'disconnected':
        return 'disconnected'
      case 'connecting':
      case 'authenticating':
        return 'connecting'
      case 'connected':
      case 'authenticated':
        return 'connected'
      case 'reconnecting':
        return 'reconnecting'
      case 'error':
        return 'error'
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getIsAuthenticated(): boolean {
    return this.connectionState === 'authenticated'
  }

  getRooms(): RoomSubscription[] {
    return Array.from(this.rooms.values())
  }

  getState() {
    return {
      status: this.getStatus(),
      connectionState: this.connectionState,
      isAuthenticated: this.getIsAuthenticated(),
      reconnectAttempts: this.reconnectAttempts,
      rooms: this.getRooms(),
      queuedOperations: this.operationQueue.length,
      authRetryCount: this.authRetryCount,
    }
  }
}

// Export both for testing and migration
export const enhancedWebSocketService = EnhancedWebSocketService.getInstance()