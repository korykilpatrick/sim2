import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, act, waitFor } from '@testing-library/react';
import { io } from 'socket.io-client';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuthStore } from '@/features/auth/services/authStore';
import { renderWithProviders, clearAuth, setupAuthenticatedUser } from '../utils/test-utils';
import React, { useEffect, useState } from 'react';

// Mock socket.io-client
vi.mock('socket.io-client');

// Mock config to enable websocket
vi.mock('@/config', () => ({
  config: {
    websocketUrl: 'http://localhost:3001',
    features: {
      websocket: true,
      debugMode: false
    }
  }
}));

// Test component that uses WebSocket
const WebSocketTestComponent = () => {
  const { 
    status,
    isAuthenticated,
    rooms,
    on, 
    emit, 
    joinVesselRoom, 
    leaveVesselRoom,
    joinAreaRoom,
    leaveAreaRoom
  } = useWebSocket();
  
  const [vesselPositions, setVesselPositions] = useState<any[]>([]);
  const [areaAlerts, setAreaAlerts] = useState<any[]>([]);
  const [creditBalance, setCreditBalance] = useState<number>(0);

  useEffect(() => {
    const unsubscribePosition = on('vessel_position_update', (data) => {
      setVesselPositions(prev => [...prev, data]);
    });

    const unsubscribeAlert = on('area_alert', (data) => {
      setAreaAlerts(prev => [...prev, data]);
    });

    const unsubscribeCredit = on('credit_balance_updated', (data) => {
      setCreditBalance(data.balance);
    });

    return () => {
      unsubscribePosition();
      unsubscribeAlert();
      unsubscribeCredit();
    };
  }, [on]);

  const handleJoinVessel = () => {
    joinVesselRoom('vessel-test-123');
  };

  const handleLeaveVessel = () => {
    leaveVesselRoom('vessel-test-123');
  };

  const handleJoinArea = () => {
    joinAreaRoom('area-test-456');
  };

  const handleLeaveArea = () => {
    leaveAreaRoom('area-test-456');
  };

  return (
    <div>
      <div data-testid="connection-state">{status}</div>
      <div data-testid="is-authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="vessel-positions">{vesselPositions.length}</div>
      <div data-testid="area-alerts">{areaAlerts.length}</div>
      <div data-testid="credit-balance">{creditBalance}</div>
      <div data-testid="rooms-count">{rooms.length}</div>
      
      <button onClick={handleJoinVessel}>Join Vessel Room</button>
      <button onClick={handleLeaveVessel}>Leave Vessel Room</button>
      <button onClick={handleJoinArea}>Join Area Room</button>
      <button onClick={handleLeaveArea}>Leave Area Room</button>
    </div>
  );
};

describe('WebSocket Integration', () => {
  let mockSocket: any;
  let socketEventHandlers: Map<string, Function[]>;

  beforeEach(() => {
    vi.clearAllMocks();
    clearAuth();
    
    // Setup socket event handlers map
    socketEventHandlers = new Map();

    // Create mock socket
    mockSocket = {
      connected: false,
      auth: {},
      io: { opts: {} },
      on: vi.fn((event: string, handler: Function) => {
        if (!socketEventHandlers.has(event)) {
          socketEventHandlers.set(event, []);
        }
        socketEventHandlers.get(event)!.push(handler);
      }),
      off: vi.fn((event: string) => {
        socketEventHandlers.delete(event);
      }),
      emit: vi.fn(),
      connect: vi.fn(() => {
        mockSocket.connected = true;
        triggerSocketEvent('connect');
      }),
      disconnect: vi.fn(() => {
        mockSocket.connected = false;
        triggerSocketEvent('disconnect', 'client disconnect');
      }),
    };

    // Mock io constructor
    (io as any).mockReturnValue(mockSocket);
  });

  afterEach(() => {
    vi.clearAllMocks();
    clearAuth();
    socketEventHandlers.clear();
  });

  // Helper to trigger socket events
  const triggerSocketEvent = (event: string, ...args: any[]) => {
    const handlers = socketEventHandlers.get(event) || [];
    handlers.forEach(handler => handler(...args));
  };

  describe('Full Connection Flow', () => {
    it('should establish connection when user logs in', async () => {
      renderWithProviders(<WebSocketTestComponent />);

      // Initially disconnected
      expect(screen.getByTestId('connection-state')).toHaveTextContent('disconnected');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('not-authenticated');

      // Simulate login
      act(() => {
        setupAuthenticatedUser();
      });

      // Wait for connection
      await waitFor(() => {
        expect(io).toHaveBeenCalledWith('http://localhost:3001', expect.objectContaining({
          transports: ['websocket', 'polling']
        }));
      });

      // Simulate successful connection
      act(() => {
        triggerSocketEvent('connect');
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true });
      });

      // Verify connected state
      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent('connected');
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('authenticated');
      });
    });

    it('should disconnect when user logs out', async () => {
      // Start logged in
      setupAuthenticatedUser();

      renderWithProviders(<WebSocketTestComponent />);

      // Wait for initial connection
      await waitFor(() => {
        expect(io).toHaveBeenCalled();
      });

      // Simulate connected state
      act(() => {
        mockSocket.connected = true;
        triggerSocketEvent('connect');
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true });
      });

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent('connected');
      });

      // Simulate logout
      act(() => {
        clearAuth();
      });

      // Verify disconnection
      await waitFor(() => {
        expect(mockSocket.disconnect).toHaveBeenCalled();
        expect(screen.getByTestId('connection-state')).toHaveTextContent('disconnected');
      });
    });
  });

  describe('Real-time Events', () => {
    beforeEach(async () => {
      // Start authenticated
      setupAuthenticatedUser();
    });

    it('should receive vessel position updates', async () => {
      renderWithProviders(<WebSocketTestComponent />);

      // Simulate connected state
      act(() => {
        mockSocket.connected = true;
        triggerSocketEvent('connect');
      });

      // Simulate vessel position update
      act(() => {
        triggerSocketEvent('vessel_position_update', {
          vesselId: 'vessel-123',
          timestamp: new Date().toISOString(),
          position: { lat: 10.5, lng: -20.3 },
          heading: 90,
          speed: 15,
          status: 'active'
        });
      });

      // Verify position received
      await waitFor(() => {
        expect(screen.getByTestId('vessel-positions')).toHaveTextContent('1');
      });
    });

    it('should receive area alerts', async () => {
      renderWithProviders(<WebSocketTestComponent />);

      // Simulate connected state
      act(() => {
        mockSocket.connected = true;
        triggerSocketEvent('connect');
      });

      // Simulate area alert
      act(() => {
        triggerSocketEvent('area_alert', {
          id: 'alert-1',
          areaId: 'area-456',
          areaName: 'Test Area',
          type: 'vessel_entered',
          severity: 'medium',
          message: 'Vessel entered area',
          timestamp: new Date().toISOString()
        });
      });

      // Verify alert received
      await waitFor(() => {
        expect(screen.getByTestId('area-alerts')).toHaveTextContent('1');
      });
    });

    it('should receive credit balance updates', async () => {
      renderWithProviders(<WebSocketTestComponent />);

      // Simulate connected state
      act(() => {
        mockSocket.connected = true;
        triggerSocketEvent('connect');
      });

      // Simulate credit balance update
      act(() => {
        triggerSocketEvent('credit_balance_updated', {
          balance: 150,
          change: -10
        });
      });

      // Verify balance updated
      await waitFor(() => {
        expect(screen.getByTestId('credit-balance')).toHaveTextContent('150');
      });
    });
  });

  describe('Room Management', () => {
    beforeEach(async () => {
      setupAuthenticatedUser();
    });

    it('should join and leave vessel rooms', async () => {
      const { getByText } = renderWithProviders(<WebSocketTestComponent />);

      // Simulate connected state
      act(() => {
        mockSocket.connected = true;
        triggerSocketEvent('connect');
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true });
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('authenticated');
      });

      // Join vessel room
      act(() => {
        getByText('Join Vessel Room').click();
      });

      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith('join_vessel_room', 'vessel-test-123');
        expect(screen.getByTestId('rooms-count')).toHaveTextContent('1');
      });

      // Leave vessel room
      act(() => {
        getByText('Leave Vessel Room').click();
      });

      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith('leave_vessel_room', 'vessel-test-123');
        expect(screen.getByTestId('rooms-count')).toHaveTextContent('0');
      });
    });

    it('should join and leave area rooms', async () => {
      const { getByText } = renderWithProviders(<WebSocketTestComponent />);

      // Simulate connected state
      act(() => {
        mockSocket.connected = true;
        triggerSocketEvent('connect');
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true });
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('authenticated');
      });

      // Join area room
      act(() => {
        getByText('Join Area Room').click();
      });

      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith('join_area_room', 'area-test-456');
        expect(screen.getByTestId('rooms-count')).toHaveTextContent('1');
      });

      // Leave area room
      act(() => {
        getByText('Leave Area Room').click();
      });

      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith('leave_area_room', 'area-test-456');
        expect(screen.getByTestId('rooms-count')).toHaveTextContent('0');
      });
    });

    it('should rejoin rooms after reconnection', async () => {
      const { getByText } = renderWithProviders(<WebSocketTestComponent />);

      // Simulate connected state
      act(() => {
        mockSocket.connected = true;
        triggerSocketEvent('connect');
        triggerSocketEvent('authenticated', { userId: 'user-1', success: true });
      });

      // Join rooms
      act(() => {
        getByText('Join Vessel Room').click();
        getByText('Join Area Room').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('rooms-count')).toHaveTextContent('2');
      });

      // Clear emit calls
      mockSocket.emit.mockClear();

      // Simulate disconnection and reconnection
      act(() => {
        triggerSocketEvent('disconnect', 'transport close');
      });

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent('disconnected');
      });

      // Simulate reconnection
      act(() => {
        mockSocket.connected = true;
        triggerSocketEvent('connect');
      });

      // Verify rooms are rejoined
      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith('join_vessel_room', 'vessel-test-123');
        expect(mockSocket.emit).toHaveBeenCalledWith('join_area_room', 'area-test-456');
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      setupAuthenticatedUser();
    });

    it('should handle connection errors', async () => {
      renderWithProviders(<WebSocketTestComponent />);

      // Simulate connection error
      act(() => {
        triggerSocketEvent('connect_error', new Error('Connection failed'));
      });

      // Verify error state
      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent('error');
      });
    });

    it('should handle unauthorized errors', async () => {
      renderWithProviders(<WebSocketTestComponent />);

      // Simulate connected then unauthorized
      act(() => {
        mockSocket.connected = true;
        triggerSocketEvent('connect');
        triggerSocketEvent('unauthorized', { message: 'Invalid token' });
      });

      // Verify auth state
      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('not-authenticated');
        expect(screen.getByTestId('connection-state')).toHaveTextContent('error');
      });
    });

    it('should handle reconnection attempts', async () => {
      renderWithProviders(<WebSocketTestComponent />);

      // Simulate connection then disconnect
      act(() => {
        mockSocket.connected = true;
        triggerSocketEvent('connect');
        mockSocket.connected = false;
        triggerSocketEvent('disconnect', 'transport error');
      });

      // Simulate reconnection attempt
      act(() => {
        triggerSocketEvent('reconnect_attempt', 1);
      });

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent('reconnecting');
      });

      // Simulate successful reconnection
      act(() => {
        mockSocket.connected = true;
        triggerSocketEvent('reconnect', 1);
        triggerSocketEvent('connect');
      });

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent('connected');
      });
    });

    it('should handle reconnection failure', async () => {
      renderWithProviders(<WebSocketTestComponent />);

      // Start connected
      act(() => {
        mockSocket.connected = true;
        triggerSocketEvent('connect');
      });

      // Simulate reconnection failure
      act(() => {
        triggerSocketEvent('reconnect_failed');
      });

      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent('error');
      });
    });
  });

  describe('Multiple Components', () => {
    it('should share WebSocket state across components', async () => {
      setupAuthenticatedUser();

      const SecondTestComponent = () => {
        const { status, rooms } = useWebSocket();
        return (
          <div>
            <div data-testid="second-status">{status}</div>
            <div data-testid="second-rooms">{rooms.length}</div>
          </div>
        );
      };

      renderWithProviders(
        <>
          <WebSocketTestComponent />
          <SecondTestComponent />
        </>
      );

      // Simulate connection
      act(() => {
        mockSocket.connected = true;
        triggerSocketEvent('connect');
      });

      // Both components should show connected
      await waitFor(() => {
        expect(screen.getByTestId('connection-state')).toHaveTextContent('connected');
        expect(screen.getByTestId('second-status')).toHaveTextContent('connected');
      });

      // Join room from first component
      act(() => {
        screen.getByText('Join Vessel Room').click();
      });

      // Both components should see the room
      await waitFor(() => {
        expect(screen.getByTestId('rooms-count')).toHaveTextContent('1');
        expect(screen.getByTestId('second-rooms')).toHaveTextContent('1');
      });
    });
  });
});