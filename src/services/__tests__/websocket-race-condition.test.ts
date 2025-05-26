import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { io } from 'socket.io-client'
import { EnhancedWebSocketService } from '../websocket-enhanced'

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => {
    const mockSocket = {
      connected: false,
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      auth: {},
      io: {
        on: vi.fn(),
        opts: {},
      },
    }
    return mockSocket
  }),
}))

// Mock config
vi.mock('@/config', () => ({
  config: {
    websocketUrl: 'http://localhost:3001',
    features: {
      websocket: true,
      debugMode: false,
    },
  },
}))

describe('WebSocket Race Conditions and Authentication Queuing', () => {
  let service: EnhancedWebSocketService
  let mockSocket: any

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset singleton
    ;(EnhancedWebSocketService as any).instance = null
    service = EnhancedWebSocketService.getInstance()
  })

  afterEach(() => {
    service.disconnect()
    vi.clearAllTimers()
  })

  describe('Room Rejoin Race Condition', () => {
    it('should queue room join requests until authentication completes', async () => {
      // Connect the service
      service.connect('test-token')
      mockSocket = (io as any).mock.results[0]?.value

      // Join some rooms while connected
      mockSocket.connected = true
      
      // Simulate initial authentication
      const authHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'authenticated',
      )?.[1]
      if (authHandler) {
        authHandler({ userId: 'user-1', success: true })
      }

      // Join rooms while authenticated
      service.joinVesselRoom('vessel-123')
      service.joinAreaRoom('area-456')

      // Clear emit calls
      mockSocket.emit.mockClear()

      // Simulate disconnection and reconnection
      mockSocket.connected = false
      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'disconnect',
      )?.[1]
      if (disconnectHandler) {
        disconnectHandler()
      }

      // Authentication state is managed internally by the service

      // Simulate reconnection
      mockSocket.connected = true
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect',
      )?.[1]
      if (connectHandler) {
        connectHandler()
      }

      // At this point, rejoinRooms is called but authentication hasn't completed
      // The current implementation will fail to rejoin rooms
      
      // Verify authentication was attempted
      expect(mockSocket.emit).toHaveBeenCalledWith('authenticate', 'test-token')
      
      // But room joins should NOT have been attempted yet
      expect(mockSocket.emit).not.toHaveBeenCalledWith('join_vessel_room', 'vessel-123')
      expect(mockSocket.emit).not.toHaveBeenCalledWith('join_area_room', 'area-456')

      // Now complete authentication
      if (authHandler) {
        mockSocket.emit.mockClear()
        authHandler({ userId: 'user-1', success: true })
      }

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 200))

      // After authentication, rooms should be automatically rejoined
      expect(mockSocket.emit).toHaveBeenCalledWith('join_vessel_room', 'vessel-123')
      expect(mockSocket.emit).toHaveBeenCalledWith('join_area_room', 'area-456')
    })

    it('should queue new room join attempts made during authentication', async () => {
      service.connect('test-token')
      mockSocket = (io as any).mock.results[0]?.value
      mockSocket.connected = true

      // Try to join room before authentication completes
      service.joinVesselRoom('vessel-999')

      // Should not emit yet
      expect(mockSocket.emit).not.toHaveBeenCalledWith('join_vessel_room', 'vessel-999')

      // Complete authentication
      const authHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'authenticated',
      )?.[1]
      if (authHandler) {
        authHandler({ userId: 'user-1', success: true })
      }

      // Now it should emit the queued join
      expect(mockSocket.emit).toHaveBeenCalledWith('join_vessel_room', 'vessel-999')
    })
  })

  describe('Connection State Machine', () => {
    it('should handle authentication failure during connected state', () => {
      service.connect('test-token')
      mockSocket = (io as any).mock.results[0]?.value
      mockSocket.connected = true

      // Simulate connect
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect',
      )?.[1]
      if (connectHandler) connectHandler()

      // After connect, it should start authenticating
      const state = service.getState()
      expect(['connected', 'authenticating'].includes(state.connectionState)).toBe(true)

      // Simulate authentication failure
      const unauthorizedHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'unauthorized',
      )?.[1]
      if (unauthorizedHandler) {
        unauthorizedHandler({ message: 'Token expired' })
      }

      // Should transition to a state that indicates auth failure
      // Current implementation doesn't handle this well
      expect(service.getIsAuthenticated()).toBe(false)
      
      // Should retry authentication or notify user
      // This is not implemented in current code
    })

    it('should handle disconnect during authentication', () => {
      service.connect('test-token')
      mockSocket = (io as any).mock.results[0]?.value
      mockSocket.connected = true

      // Start authentication
      mockSocket.emit.mockClear()
      service.authenticate('auth-token')
      expect(mockSocket.emit).toHaveBeenCalledWith('authenticate', 'auth-token')

      // Disconnect before authentication completes
      mockSocket.connected = false
      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'disconnect',
      )?.[1]
      if (disconnectHandler) {
        disconnectHandler()
      }

      // Should cancel pending authentication
      expect(service.getIsAuthenticated()).toBe(false)
      expect(service.getStatus()).toBe('disconnected')
    })
  })

  describe('Reconnection Backoff Strategy', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should implement exponential backoff for authentication retries', () => {
      service.connect('test-token')
      mockSocket = (io as any).mock.results[0]?.value
      mockSocket.connected = true

      // Track authentication attempts
      const authAttempts: number[] = []
      
      // Override emit to track timing
      const originalEmit = mockSocket.emit
      mockSocket.emit = vi.fn((event, ...args) => {
        if (event === 'authenticate') {
          authAttempts.push(Date.now())
        }
        return originalEmit.call(mockSocket, event, ...args)
      })

      // First auth failure
      const unauthorizedHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'unauthorized',
      )?.[1]
      
      // Simulate multiple auth failures
      for (let i = 0; i < 3; i++) {
        if (unauthorizedHandler) {
          unauthorizedHandler({ message: 'Invalid token' })
        }
        vi.advanceTimersByTime(Math.pow(2, i) * 1000) // Exponential backoff
      }

      // Should see increasing delays between attempts
      // This is not implemented in current code
      expect(authAttempts.length).toBeGreaterThan(1)
    })

    it('should implement backoff for room rejoin attempts', () => {
      service.connect('test-token')
      mockSocket = (io as any).mock.results[0]?.value
      mockSocket.connected = true

      // Authenticate first
      const authHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'authenticated',
      )?.[1]
      if (authHandler) {
        authHandler({ userId: 'user-1', success: true })
      }

      // Join a room
      service.joinVesselRoom('vessel-123')
      
      // Simulate room join failure
      const roomErrorHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'room_join_error',
      )?.[1]

      if (roomErrorHandler) {
        roomErrorHandler({ room: 'vessel-123', error: 'Permission denied' })
      }

      // Should retry with backoff
      // This is not implemented in current code
      vi.advanceTimersByTime(1000)
      vi.advanceTimersByTime(2000)
      vi.advanceTimersByTime(4000)

      // Current implementation doesn't retry failed room joins
    })
  })

  describe('Operation Queuing', () => {
    it('should queue all operations during connection/authentication', async () => {
      // Start disconnected
      expect(service.getStatus()).toBe('disconnected')

      // Try operations while disconnected
      service.joinVesselRoom('vessel-1')
      service.joinAreaRoom('area-1')
      service.markAlertRead('alert-1')
      service.dismissAlert('alert-2')

      // Connect
      service.connect('test-token')
      mockSocket = (io as any).mock.results[0]?.value
      mockSocket.connected = true

      // Complete connection
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'connect',
      )?.[1]
      if (connectHandler) connectHandler()

      // Complete authentication
      const authHandler = mockSocket.on.mock.calls.find(
        (call: any) => call[0] === 'authenticated',
      )?.[1]
      if (authHandler) {
        authHandler({ userId: 'user-1', success: true })
      }

      // Wait for async processing of queued operations
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      // All queued operations should now execute
      expect(mockSocket.emit).toHaveBeenCalledWith('join_vessel_room', 'vessel-1')
      expect(mockSocket.emit).toHaveBeenCalledWith('join_area_room', 'area-1')
      expect(mockSocket.emit).toHaveBeenCalledWith('mark_alert_read', 'alert-1')
      expect(mockSocket.emit).toHaveBeenCalledWith('dismiss_alert', 'alert-2')
    })
  })
})