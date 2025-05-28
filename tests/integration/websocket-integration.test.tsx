import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, act, waitFor } from '@testing-library/react'
import { io } from 'socket.io-client'
import { useWebSocket } from '@/hooks/useWebSocket'
import {
  renderWithProviders,
  clearAuth,
  setupAuthenticatedUser,
} from '../utils/test-helpers'
import React, { useEffect, useState } from 'react'

// Mock socket.io-client
vi.mock('socket.io-client')

// Mock config to enable websocket
vi.mock('@/config', () => ({
  config: {
    websocketUrl: 'http://localhost:3001',
    features: {
      websocket: true,
      debugMode: false,
    },
  },
}))

// Test component that uses WebSocket
const WebSocketTestComponent = () => {
  const {
    status,
    isAuthenticated,
    on,

    joinVesselRoom,
    leaveVesselRoom,
    joinAreaRoom,
    leaveAreaRoom,
  } = useWebSocket()

  interface VesselPosition {
    vesselId: string
    timestamp: string
    position: { lat: number; lng: number }
    heading: number
    speed: number
    status: string
  }

  interface AreaAlert {
    id: string
    areaId: string
    areaName: string
    type: string
    severity: string
    message: string
    timestamp: string
  }

  const [vesselPositions, setVesselPositions] = useState<VesselPosition[]>([])
  const [areaAlerts, setAreaAlerts] = useState<AreaAlert[]>([])
  const [creditBalance, setCreditBalance] = useState<number>(0)
  const [joinedRooms, setJoinedRooms] = useState<string[]>([])

  useEffect(() => {
    const unsubscribePosition = on('vessel_position_update', (data) => {
      setVesselPositions((prev) => [...prev, data])
    })

    const unsubscribeAlert = on('area_alert', (data) => {
      setAreaAlerts((prev) => [...prev, data])
    })

    const unsubscribeCredit = on('credit_balance_updated', (data) => {
      setCreditBalance(data.balance)
    })

    const unsubscribeRoomJoined = on('room_joined', (data) => {
      setJoinedRooms((prev) => [...prev, `${data.type}:${data.room}`])
    })

    const unsubscribeRoomLeft = on('room_left', (data) => {
      setJoinedRooms((prev) =>
        prev.filter((room) => room !== `${data.type}:${data.room}`),
      )
    })

    return () => {
      unsubscribePosition()
      unsubscribeAlert()
      unsubscribeCredit()
      unsubscribeRoomJoined()
      unsubscribeRoomLeft()
    }
  }, [on])

  const handleJoinVessel = () => {
    joinVesselRoom('vessel-test-123')
  }

  const handleLeaveVessel = () => {
    leaveVesselRoom('vessel-test-123')
  }

  const handleJoinArea = () => {
    joinAreaRoom('area-test-456')
  }

  const handleLeaveArea = () => {
    leaveAreaRoom('area-test-456')
  }

  return (
    <div>
      <div data-testid="connection-state">{status}</div>
      <div data-testid="is-authenticated">
        {isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </div>
      <div data-testid="vessel-positions">{vesselPositions.length}</div>
      <div data-testid="area-alerts">{areaAlerts.length}</div>
      <div data-testid="credit-balance">{creditBalance}</div>
      <div data-testid="rooms-count">{joinedRooms.length}</div>

      <button onClick={handleJoinVessel}>Join Vessel Room</button>
      <button onClick={handleLeaveVessel}>Leave Vessel Room</button>
      <button onClick={handleJoinArea}>Join Area Room</button>
      <button onClick={handleLeaveArea}>Leave Area Room</button>
    </div>
  )
}

describe('WebSocket Integration', () => {
  interface MockSocket {
    connected: boolean
    auth: Record<string, unknown>
    io: {
      opts: Record<string, unknown>
      on: jest.Mock
      off: jest.Mock
    }
    on: jest.Mock
    off: jest.Mock
    emit: jest.Mock
    connect: jest.Mock
    disconnect: jest.Mock
  }

  let mockSocket: MockSocket
  let socketEventHandlers: Map<string, ((...args: unknown[]) => void)[]>

  beforeEach(() => {
    vi.clearAllMocks()
    clearAuth()

    // Setup socket event handlers map
    socketEventHandlers = new Map()

    // Create mock socket
    mockSocket = {
      connected: false,
      auth: {},
      io: {
        opts: {},
        on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
          if (!socketEventHandlers.has(event)) {
            socketEventHandlers.set(event, [])
          }
          socketEventHandlers.get(event)!.push(handler)
        }),
        off: vi.fn((event: string) => {
          socketEventHandlers.delete(event)
        }),
      },
      on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
        if (!socketEventHandlers.has(event)) {
          socketEventHandlers.set(event, [])
        }
        socketEventHandlers.get(event)!.push(handler)
      }),
      off: vi.fn((event: string) => {
        socketEventHandlers.delete(event)
      }),
      emit: vi.fn(),
      connect: vi.fn(() => {
        mockSocket.connected = true
        triggerSocketEvent('connect')
      }),
      disconnect: vi.fn(() => {
        mockSocket.connected = false
        // Don't trigger the event here, let the test do it
      }),
    }

    // Mock io constructor
    ;(io as jest.Mock).mockReturnValue(mockSocket)
  })

  afterEach(() => {
    vi.clearAllMocks()
    clearAuth()
    socketEventHandlers.clear()
  })

  // Helper to trigger socket events
  const triggerSocketEvent = (event: string, ...args: unknown[]) => {
    const handlers = socketEventHandlers.get(event) || []
    handlers.forEach((handler) => handler(...args))
  }

  describe('Full Connection Flow', () => {
    it('should establish connection when user logs in', async () => {
      renderWithProviders(<WebSocketTestComponent />)

      // Initially disconnected
      expect(screen.getByTestId('connection-state')).toHaveTextContent(
        'disconnected',
      )
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
        'not-authenticated',
      )

      // Simulate login
      act(() => {
        setupAuthenticatedUser()
      })

      // Wait for connection
      await waitFor(() => {
        expect(io).toHaveBeenCalledWith(
          'http://localhost:3001',
          expect.objectContaining({
            transports: ['websocket', 'polling'],
            withCredentials: true,
          }),
        )
      })

      // Simulate successful connection
      act(() => {
        mockSocket.connected = true
        triggerSocketEvent('connect')
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true })
      })

      // Verify connected state
      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'connected',
        )
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
          'authenticated',
        )
      })
    })

    it('should disconnect when user logs out', async () => {
      // Start logged in
      setupAuthenticatedUser()

      const { rerender } = renderWithProviders(<WebSocketTestComponent />)

      // Wait for initial connection
      await waitFor(() => {
        expect(io).toHaveBeenCalled()
      })

      // Simulate connected state
      act(() => {
        mockSocket.connected = true
        triggerSocketEvent('connect')
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true })
      })

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'connected',
        )
      })

      // Clear emit calls before logout
      mockSocket.disconnect.mockClear()

      // Simulate logout by clearing auth
      act(() => {
        clearAuth()
      })

      // Force re-render to propagate auth state change
      rerender(<WebSocketTestComponent />)

      // The WebSocketProvider will call disconnect when user becomes null
      await waitFor(
        () => {
          expect(mockSocket.disconnect).toHaveBeenCalled()
        },
        { timeout: 2000 },
      )

      // Simulate disconnect event
      act(() => {
        mockSocket.connected = false
        triggerSocketEvent('disconnect', 'client disconnect')
      })

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'disconnected',
        )
      })
    })
  })

  describe('Real-time Events', () => {
    beforeEach(async () => {
      // Start authenticated
      setupAuthenticatedUser()
    })

    it('should receive vessel position updates', async () => {
      renderWithProviders(<WebSocketTestComponent />)

      // Wait for connection to be established
      await waitFor(() => {
        expect(io).toHaveBeenCalled()
      })

      // Simulate connected and authenticated state
      act(() => {
        mockSocket.connected = true
        triggerSocketEvent('connect')
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true })
      })

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'connected',
        )
      })

      // Simulate vessel position update
      act(() => {
        triggerSocketEvent('vessel_position_update', {
          vesselId: 'vessel-123',
          timestamp: new Date().toISOString(),
          position: { lat: 10.5, lng: -20.3 },
          heading: 90,
          speed: 15,
          status: 'active',
        })
      })

      // Verify position received
      await waitFor(() => {
        expect(screen.getByTestId('vessel-positions')).toHaveTextContent('1')
      })
    })

    it('should receive area alerts', async () => {
      renderWithProviders(<WebSocketTestComponent />)

      // Wait for connection to be established
      await waitFor(() => {
        expect(io).toHaveBeenCalled()
      })

      // Simulate connected and authenticated state
      act(() => {
        mockSocket.connected = true
        triggerSocketEvent('connect')
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true })
      })

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'connected',
        )
      })

      // Simulate area alert
      act(() => {
        triggerSocketEvent('area_alert', {
          id: 'alert-1',
          areaId: 'area-456',
          areaName: 'Test Area',
          type: 'vessel_entered',
          severity: 'medium',
          message: 'Vessel entered area',
          timestamp: new Date().toISOString(),
        })
      })

      // Verify alert received
      await waitFor(() => {
        expect(screen.getByTestId('area-alerts')).toHaveTextContent('1')
      })
    })

    it('should receive credit balance updates', async () => {
      renderWithProviders(<WebSocketTestComponent />)

      // Wait for connection to be established
      await waitFor(() => {
        expect(io).toHaveBeenCalled()
      })

      // Simulate connected and authenticated state
      act(() => {
        mockSocket.connected = true
        triggerSocketEvent('connect')
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true })
      })

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'connected',
        )
      })

      // Simulate credit balance update
      act(() => {
        triggerSocketEvent('credit_balance_updated', {
          balance: 150,
          change: -10,
        })
      })

      // Verify balance updated
      await waitFor(() => {
        expect(screen.getByTestId('credit-balance')).toHaveTextContent('150')
      })
    })
  })

  describe('Room Management', () => {
    beforeEach(async () => {
      setupAuthenticatedUser()
    })

    it('should join and leave vessel rooms', async () => {
      const { getByText } = renderWithProviders(<WebSocketTestComponent />)

      // Wait for connection to be established
      await waitFor(() => {
        expect(io).toHaveBeenCalled()
      })

      // Simulate connected state
      act(() => {
        mockSocket.connected = true
        triggerSocketEvent('connect')
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true })
      })

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
          'authenticated',
        )
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'connected',
        )
      })

      // Clear emit calls
      mockSocket.emit.mockClear()

      // Join vessel room
      act(() => {
        getByText('Join Vessel Room').click()
      })

      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith(
          'join_vessel_room',
          'vessel-test-123',
        )
      })

      // Simulate room join acknowledgment
      act(() => {
        triggerSocketEvent('room_joined', {
          room: 'vessel-test-123',
          type: 'vessel',
        })
      })

      await waitFor(() => {
        expect(screen.getByTestId('rooms-count')).toHaveTextContent('1')
      })

      // Leave vessel room
      act(() => {
        getByText('Leave Vessel Room').click()
      })

      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith(
          'leave_vessel_room',
          'vessel-test-123',
        )
      })

      // Simulate room leave acknowledgment
      act(() => {
        triggerSocketEvent('room_left', {
          room: 'vessel-test-123',
          type: 'vessel',
        })
      })

      await waitFor(() => {
        expect(screen.getByTestId('rooms-count')).toHaveTextContent('0')
      })
    })

    it('should join and leave area rooms', async () => {
      const { getByText } = renderWithProviders(<WebSocketTestComponent />)

      // Wait for connection to be established
      await waitFor(() => {
        expect(io).toHaveBeenCalled()
      })

      // Simulate connected state
      act(() => {
        mockSocket.connected = true
        triggerSocketEvent('connect')
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true })
      })

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
          'authenticated',
        )
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'connected',
        )
      })

      // Clear emit calls
      mockSocket.emit.mockClear()

      // Join area room
      act(() => {
        getByText('Join Area Room').click()
      })

      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith(
          'join_area_room',
          'area-test-456',
        )
      })

      // Simulate room join acknowledgment
      act(() => {
        triggerSocketEvent('room_joined', {
          room: 'area-test-456',
          type: 'area',
        })
      })

      await waitFor(() => {
        expect(screen.getByTestId('rooms-count')).toHaveTextContent('1')
      })

      // Leave area room
      act(() => {
        getByText('Leave Area Room').click()
      })

      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith(
          'leave_area_room',
          'area-test-456',
        )
      })

      // Simulate room leave acknowledgment
      act(() => {
        triggerSocketEvent('room_left', { room: 'area-test-456', type: 'area' })
      })

      await waitFor(() => {
        expect(screen.getByTestId('rooms-count')).toHaveTextContent('0')
      })
    })

    it('should rejoin rooms after reconnection', async () => {
      const { getByText } = renderWithProviders(<WebSocketTestComponent />)

      // Wait for connection to be established
      await waitFor(() => {
        expect(io).toHaveBeenCalled()
      })

      // Simulate connected state
      act(() => {
        mockSocket.connected = true
        triggerSocketEvent('connect')
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true })
      })

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'connected',
        )
      })

      // Join rooms
      act(() => {
        getByText('Join Vessel Room').click()
        getByText('Join Area Room').click()
      })

      // Simulate room join acknowledgments
      act(() => {
        triggerSocketEvent('room_joined', {
          room: 'vessel-test-123',
          type: 'vessel',
        })
        triggerSocketEvent('room_joined', {
          room: 'area-test-456',
          type: 'area',
        })
      })

      await waitFor(() => {
        expect(screen.getByTestId('rooms-count')).toHaveTextContent('2')
      })

      // Clear emit calls
      mockSocket.emit.mockClear()

      // Simulate disconnection
      act(() => {
        mockSocket.connected = false
        triggerSocketEvent('disconnect', 'transport close')
      })

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'disconnected',
        )
      })

      // Simulate reconnection
      act(() => {
        mockSocket.connected = true
        triggerSocketEvent('connect')
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true })
      })

      // Verify rooms are rejoined after authentication
      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith(
          'join_vessel_room',
          'vessel-test-123',
        )
        expect(mockSocket.emit).toHaveBeenCalledWith(
          'join_area_room',
          'area-test-456',
        )
      })
    })
  })

  describe('Error Handling', () => {
    beforeEach(async () => {
      setupAuthenticatedUser()
    })

    it('should handle connection errors', async () => {
      renderWithProviders(<WebSocketTestComponent />)

      // Wait for connection attempt
      await waitFor(() => {
        expect(io).toHaveBeenCalled()
      })

      // Simulate connection error
      act(() => {
        triggerSocketEvent('connect_error', new Error('Connection failed'))
      })

      // Verify error state
      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'error',
        )
      })
    })

    it('should handle unauthorized errors', async () => {
      renderWithProviders(<WebSocketTestComponent />)

      // Wait for connection attempt
      await waitFor(() => {
        expect(io).toHaveBeenCalled()
      })

      // Simulate connected then unauthorized
      act(() => {
        mockSocket.connected = true
        triggerSocketEvent('connect')
        triggerSocketEvent('unauthorized', { message: 'Invalid token' })
      })

      // Verify auth state
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent(
          'not-authenticated',
        )
      })
    })

    it('should handle reconnection attempts', async () => {
      renderWithProviders(<WebSocketTestComponent />)

      // Wait for initial connection
      await waitFor(() => {
        expect(io).toHaveBeenCalled()
      })

      // Simulate connection then disconnect
      act(() => {
        mockSocket.connected = true
        triggerSocketEvent('connect')
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true })
      })

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'connected',
        )
      })

      // Simulate disconnect
      act(() => {
        mockSocket.connected = false
        triggerSocketEvent('disconnect', 'transport error')
      })

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'disconnected',
        )
      })

      // Simulate reconnection attempt
      act(() => {
        triggerSocketEvent('reconnect_attempt', 1)
      })

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'reconnecting',
        )
      })

      // Simulate successful reconnection
      act(() => {
        mockSocket.connected = true
        triggerSocketEvent('reconnect', 1)
        triggerSocketEvent('connect')
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true })
      })

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'connected',
        )
      })
    })

    it('should handle reconnection failure', async () => {
      renderWithProviders(<WebSocketTestComponent />)

      // Wait for initial connection
      await waitFor(() => {
        expect(io).toHaveBeenCalled()
      })

      // Start connected
      act(() => {
        mockSocket.connected = true
        triggerSocketEvent('connect')
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true })
      })

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'connected',
        )
      })

      // Simulate reconnection failure
      act(() => {
        mockSocket.connected = false
        triggerSocketEvent('reconnect_failed')
      })

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'error',
        )
      })
    })
  })

  describe('Multiple Components', () => {
    it('should share WebSocket state across components', async () => {
      setupAuthenticatedUser()

      const SecondTestComponent = () => {
        const { status, rooms } = useWebSocket()
        return (
          <div>
            <div data-testid="second-status">{status}</div>
            <div data-testid="second-rooms">{rooms.length}</div>
          </div>
        )
      }

      renderWithProviders(
        <>
          <WebSocketTestComponent />
          <SecondTestComponent />
        </>,
      )

      // Wait for connection
      await waitFor(() => {
        expect(io).toHaveBeenCalled()
      })

      // Simulate connection and authentication
      act(() => {
        mockSocket.connected = true
        triggerSocketEvent('connect')
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true })
      })

      // Both components should show connected
      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent(
          'connected',
        )
        expect(screen.getByTestId('second-status')).toHaveTextContent(
          'connected',
        )
      })

      // Join room from first component
      act(() => {
        screen.getByText('Join Vessel Room').click()
      })

      // Simulate room join acknowledgment
      act(() => {
        triggerSocketEvent('room_joined', {
          room: 'vessel-test-123',
          type: 'vessel',
        })
      })

      // Both components should see the room
      await waitFor(() => {
        expect(screen.getByTestId('rooms-count')).toHaveTextContent('1')
        expect(screen.getByTestId('second-rooms')).toHaveTextContent('1')
      })
    })
  })
})
