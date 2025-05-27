import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useWebSocket } from '../useWebSocket'
import { websocketService } from '@/services/websocket'
import type { WebSocketStatus } from '@/types/websocket'

// Mock dependencies
vi.mock('@/services/websocket', () => ({
  websocketService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    authenticate: vi.fn(),
    on: vi.fn((_event, _handler) => vi.fn()), // Return unsubscribe function
    off: vi.fn(),
    emit: vi.fn(),
    getStatus: vi.fn(() => 'disconnected'),
    getState: vi.fn(() => ({
      status: 'disconnected' as WebSocketStatus,
      isAuthenticated: false,
      reconnectAttempts: 0,
      rooms: [],
    })),
    isConnected: vi.fn(() => false),
    getIsAuthenticated: vi.fn(() => false),
    joinVesselRoom: vi.fn(),
    leaveVesselRoom: vi.fn(),
    joinAreaRoom: vi.fn(),
    leaveAreaRoom: vi.fn(),
    markAlertRead: vi.fn(),
    dismissAlert: vi.fn(),
  },
}))

// Mock useAuth to avoid Router dependency
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'test@example.com' },
    token: 'test-token',
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  }),
}))

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Connection State', () => {
    it('should return initial connection state', () => {
      const { result } = renderHook(() => useWebSocket())

      expect(result.current.status).toBe('disconnected')
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.reconnectAttempts).toBe(0)
    })

    it('should auto-connect when user is authenticated', () => {
      renderHook(() => useWebSocket())

      // Should connect automatically with token from useAuth mock
      expect(websocketService.connect).toHaveBeenCalledWith('test-token')
    })

    it('should update state when connection changes', async () => {
      const { result } = renderHook(() => useWebSocket())

      // Find and call the connect callback
      const connectCallback = (websocketService.on as any).mock.calls.find(
        (call: [string, () => void]) => call[0] === 'connect',
      )?.[1]

      // Update mock to return connected state
      ;(websocketService.getStatus as any).mockReturnValue('connected')
      ;(websocketService.getIsAuthenticated as any).mockReturnValue(true)
      ;(websocketService.getState as any).mockReturnValue({
        status: 'connected',
        isAuthenticated: true,
        reconnectAttempts: 0,
        rooms: [],
      })

      act(() => {
        if (connectCallback) connectCallback()
      })

      await waitFor(() => {
        expect(result.current.status).toBe('connected')
        expect(result.current.isAuthenticated).toBe(true)
      })
    })

    it('should handle error states', async () => {
      const { result } = renderHook(() => useWebSocket())

      const errorCallback = (websocketService.on as any).mock.calls.find(
        (call: [string, () => void]) => call[0] === 'connect_error',
      )?.[1]

      ;(websocketService.getStatus as any).mockReturnValue('error')
      ;(websocketService.getState as any).mockReturnValue({
        status: 'error',
        isAuthenticated: false,
        reconnectAttempts: 3,
        rooms: [],
      })

      act(() => {
        if (errorCallback) errorCallback()
      })

      await waitFor(() => {
        expect(result.current.status).toBe('error')
      })
    })
  })

  describe('Event Handling', () => {
    it('should subscribe to events', () => {
      const { result } = renderHook(() => useWebSocket())
      const handler = vi.fn()

      act(() => {
        result.current.on('vessel_position_update', handler)
      })

      expect(websocketService.on).toHaveBeenCalledWith(
        'vessel_position_update',
        handler,
      )
    })

    it('should provide off method for unsubscribing', () => {
      const { result } = renderHook(() => useWebSocket())
      const handler = vi.fn()

      act(() => {
        result.current.off('vessel_position_update', handler)
      })

      expect(websocketService.off).toHaveBeenCalledWith(
        'vessel_position_update',
        handler,
      )
    })

    it('should cleanup event subscriptions on unmount', () => {
      const unsubscribe = vi.fn()
      ;(websocketService.on as any).mockReturnValue(unsubscribe)

      const { result, unmount } = renderHook(() => useWebSocket())
      const handler = vi.fn()

      act(() => {
        result.current.on('vessel_position_update', handler)
      })

      unmount()

      expect(unsubscribe).toHaveBeenCalled()
    })

    it('should handle multiple event subscriptions', () => {
      const { result } = renderHook(() => useWebSocket())
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      act(() => {
        result.current.on('area_alert', handler1)
        result.current.on('credit_balance_updated', handler2)
      })

      expect(websocketService.on).toHaveBeenCalledWith('area_alert', handler1)
      expect(websocketService.on).toHaveBeenCalledWith(
        'credit_balance_updated',
        handler2,
      )
    })
  })

  describe('Connection Methods', () => {
    it('should provide connect method', () => {
      const { result } = renderHook(() => useWebSocket())

      // Clear initial auto-connect
      vi.clearAllMocks()

      act(() => {
        result.current.connect()
      })

      // Connect uses the token from useAuth
      expect(websocketService.connect).toHaveBeenCalledWith('test-token')
    })

    it('should provide disconnect method', () => {
      const { result } = renderHook(() => useWebSocket())

      act(() => {
        result.current.disconnect()
      })

      expect(websocketService.disconnect).toHaveBeenCalled()
    })
  })

  describe('Room Management', () => {
    it('should join vessel room', () => {
      const { result } = renderHook(() => useWebSocket())

      act(() => {
        result.current.joinVesselRoom('vessel-123')
      })

      expect(websocketService.joinVesselRoom).toHaveBeenCalledWith('vessel-123')
    })

    it('should leave vessel room', () => {
      const { result } = renderHook(() => useWebSocket())

      act(() => {
        result.current.leaveVesselRoom('vessel-123')
      })

      expect(websocketService.leaveVesselRoom).toHaveBeenCalledWith(
        'vessel-123',
      )
    })

    it('should join area room', () => {
      const { result } = renderHook(() => useWebSocket())

      act(() => {
        result.current.joinAreaRoom('area-456')
      })

      expect(websocketService.joinAreaRoom).toHaveBeenCalledWith('area-456')
    })

    it('should leave area room', () => {
      const { result } = renderHook(() => useWebSocket())

      act(() => {
        result.current.leaveAreaRoom('area-456')
      })

      expect(websocketService.leaveAreaRoom).toHaveBeenCalledWith('area-456')
    })
  })

  describe('Alert Management', () => {
    it('should mark alert as read', () => {
      const { result } = renderHook(() => useWebSocket())

      act(() => {
        result.current.markAlertRead('alert-123')
      })

      expect(websocketService.markAlertRead).toHaveBeenCalledWith('alert-123')
    })

    it('should dismiss alert', () => {
      const { result } = renderHook(() => useWebSocket())

      act(() => {
        result.current.dismissAlert('alert-456')
      })

      expect(websocketService.dismissAlert).toHaveBeenCalledWith('alert-456')
    })
  })

  describe('State Properties', () => {
    it('should expose rooms array', () => {
      const { result } = renderHook(() => useWebSocket())
      expect(result.current.rooms).toEqual([])
    })

    it('should update rooms when state changes', async () => {
      const mockRooms = [
        { room: 'vessel-1', type: 'vessel' as const, joinedAt: '2025-01-01' },
      ]

      const { result } = renderHook(() => useWebSocket())

      // Find a state update callback
      const connectCallback = (websocketService.on as any).mock.calls.find(
        (call: [string, () => void]) => call[0] === 'connect',
      )?.[1]

      // Update mock to return new state
      ;(websocketService.getState as any).mockReturnValue({
        status: 'connected',
        isAuthenticated: true,
        reconnectAttempts: 0,
        rooms: mockRooms,
      })

      act(() => {
        if (connectCallback) connectCallback()
      })

      await waitFor(() => {
        expect(result.current.rooms).toEqual(mockRooms)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle rapid state changes', () => {
      const { result } = renderHook(() => useWebSocket())

      act(() => {
        result.current.connect()
        result.current.disconnect()
        result.current.connect()
      })

      // Initial connect + 2 manual connects = 3 total
      expect(websocketService.connect).toHaveBeenCalledTimes(3)
      expect(websocketService.disconnect).toHaveBeenCalledTimes(1)
    })

    it('should handle null/undefined in alert methods', () => {
      const { result } = renderHook(() => useWebSocket())

      act(() => {
        result.current.markAlertRead(null as unknown as string)
        result.current.dismissAlert(undefined as unknown as string)
      })

      expect(websocketService.markAlertRead).toHaveBeenCalledWith(null)
      expect(websocketService.dismissAlert).toHaveBeenCalledWith(undefined)
    })

    it('should cleanup all subscriptions on unmount', () => {
      const unsubscribe1 = vi.fn()
      const unsubscribe2 = vi.fn()
      const unsubscribe3 = vi.fn()

      ;(websocketService.on as any)
        .mockReturnValueOnce(unsubscribe1)
        .mockReturnValueOnce(unsubscribe2)
        .mockReturnValueOnce(unsubscribe3)

      const { result, unmount } = renderHook(() => useWebSocket())

      act(() => {
        result.current.on('vessel_position_update', vi.fn())
        result.current.on('area_alert', vi.fn())
        result.current.on('credit_balance_updated', vi.fn())
      })

      unmount()

      // Should unsubscribe from user events
      expect(unsubscribe1).toHaveBeenCalled()
      expect(unsubscribe2).toHaveBeenCalled()
      expect(unsubscribe3).toHaveBeenCalled()
    })
  })

  describe('Hook Return Value', () => {
    it('should return all expected properties and methods', () => {
      const { result } = renderHook(() => useWebSocket())

      // State properties
      expect(result.current).toHaveProperty('status')
      expect(result.current).toHaveProperty('isAuthenticated')
      expect(result.current).toHaveProperty('reconnectAttempts')
      expect(result.current).toHaveProperty('rooms')

      // Methods
      expect(result.current).toHaveProperty('connect')
      expect(result.current).toHaveProperty('disconnect')
      expect(result.current).toHaveProperty('on')
      expect(result.current).toHaveProperty('off')
      expect(result.current).toHaveProperty('joinVesselRoom')
      expect(result.current).toHaveProperty('leaveVesselRoom')
      expect(result.current).toHaveProperty('joinAreaRoom')
      expect(result.current).toHaveProperty('leaveAreaRoom')
      expect(result.current).toHaveProperty('markAlertRead')
      expect(result.current).toHaveProperty('dismissAlert')
    })
  })
})
