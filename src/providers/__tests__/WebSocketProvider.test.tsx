import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor, act, render } from '@testing-library/react'
import { websocketService } from '@/services/websocket'
import {
  renderWithProviders,
  clearAuth,
  setupAuthenticatedUser,
} from '../../../tests/utils/test-helpers'
import { TestProviders } from '../../../tests/utils/test-utils'

// Mock dependencies
vi.mock('@/services/websocket', () => ({
  websocketService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(() => vi.fn()),
    emit: vi.fn(),
  },
}))

// Mock config to enable websocket
vi.mock('@/config', () => ({
  config: {
    features: {
      websocket: true,
      debugMode: false,
    },
  },
}))

// Test component to verify WebSocket context
const TestComponent = () => {
  return <div data-testid="test-component">WebSocket Test Component</div>
}

describe('WebSocketProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearAuth()
  })

  afterEach(() => {
    vi.clearAllMocks()
    clearAuth()
  })

  describe('Initialization', () => {
    it('should render children', () => {
      renderWithProviders(<div data-testid="child">Test Child</div>)

      expect(screen.getByTestId('child')).toBeDefined()
    })

    it('should connect when authenticated on mount', async () => {
      setupAuthenticatedUser()

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(websocketService.connect).toHaveBeenCalled()
      })
    })

    it('should not connect when not authenticated', () => {
      renderWithProviders(<TestComponent />)

      expect(websocketService.connect).not.toHaveBeenCalled()
    })

    it('should only initialize once', async () => {
      setupAuthenticatedUser()

      const { rerender } = renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(websocketService.connect).toHaveBeenCalledTimes(1)
      })

      // Re-render should not reconnect
      rerender(<TestComponent />)

      expect(websocketService.connect).toHaveBeenCalledTimes(1)
    })
  })

  describe('Authentication State Changes', () => {
    it('should connect when user logs in after mount', async () => {
      renderWithProviders(<TestComponent />)

      expect(websocketService.connect).not.toHaveBeenCalled()

      // Simulate login
      setupAuthenticatedUser()

      await waitFor(() => {
        expect(websocketService.connect).toHaveBeenCalled()
      })
    })

    it('should disconnect when user logs out', async () => {
      setupAuthenticatedUser()

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(websocketService.connect).toHaveBeenCalled()
      })

      // Clear previous mock calls
      ;(websocketService.disconnect as any).mockClear()

      // Simulate logout
      act(() => {
        clearAuth()
      })

      await waitFor(
        () => {
          expect(websocketService.disconnect).toHaveBeenCalled()
        },
        { timeout: 2000 },
      )
    })
  })

  describe('Event Listeners', () => {
    it('should register connection event listeners', async () => {
      setupAuthenticatedUser()

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(websocketService.on).toHaveBeenCalledWith(
          'connect',
          expect.any(Function),
        )
        expect(websocketService.on).toHaveBeenCalledWith(
          'disconnect',
          expect.any(Function),
        )
        expect(websocketService.on).toHaveBeenCalledWith(
          'authenticated',
          expect.any(Function),
        )
        expect(websocketService.on).toHaveBeenCalledWith(
          'unauthorized',
          expect.any(Function),
        )
      })
    })

    it('should handle connection events', async () => {
      let connectHandler: () => void
      let disconnectHandler: () => void
      ;(websocketService.on as any).mockImplementation(
        (event: string, handler: () => void) => {
          if (event === 'connect') connectHandler = handler
          if (event === 'disconnect') disconnectHandler = handler
          return vi.fn()
        },
      )

      setupAuthenticatedUser()

      const { container } = renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(websocketService.connect).toHaveBeenCalled()
      })

      // Test connect event
      if (connectHandler!) {
        connectHandler()
      }

      // Test disconnect event
      if (disconnectHandler!) {
        disconnectHandler()
      }

      // Provider should still render children
      expect(
        container.querySelector('[data-testid="test-component"]'),
      ).toBeDefined()
    })

    it('should handle authenticated event', async () => {
      let authenticatedHandler: (data: { success: boolean }) => void = () => {}

      ;(websocketService.on as any).mockImplementation(
        (event: string, handler: (data: { success: boolean }) => void) => {
          if (event === 'authenticated') authenticatedHandler = handler
          return vi.fn()
        },
      )

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      setupAuthenticatedUser()

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(websocketService.connect).toHaveBeenCalled()
      })

      // Test authenticated event
      authenticatedHandler({ success: true })

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('[WebSocketProvider] Authenticated:'),
          true,
        )
      })

      consoleSpy.mockRestore()
    })

    it('should handle unauthorized event', async () => {
      let unauthorizedHandler: (data: { message: string }) => void
      ;(websocketService.on as any).mockImplementation(
        (event: string, handler: (data: { message: string }) => void) => {
          if (event === 'unauthorized') unauthorizedHandler = handler
          return vi.fn()
        },
      )

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      setupAuthenticatedUser()

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(websocketService.connect).toHaveBeenCalled()
      })

      // Test unauthorized event
      if (unauthorizedHandler!) {
        unauthorizedHandler({ message: 'Invalid token' })
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WebSocketProvider] Unauthorized:'),
        'Invalid token',
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Debug Mode', () => {
    it('should register debug listeners when enabled', async () => {
      // Re-mock config with debug mode enabled
      vi.doMock('@/config', () => ({
        config: {
          features: {
            websocket: true,
            debugMode: true,
          },
        },
      }))

      // Clear module cache and reimport
      vi.resetModules()
      const { WebSocketProvider: DebugWebSocketProvider } = await import(
        '../WebSocketProvider'
      )

      setupAuthenticatedUser()

      // Use the re-imported provider
      render(
        <TestProviders>
          <DebugWebSocketProvider>
            <TestComponent />
          </DebugWebSocketProvider>
        </TestProviders>,
      )

      await waitFor(() => {
        // Check if debug listeners were registered
        const calls = (websocketService.on as any).mock.calls
        const hasServerMessageListener = calls.some(
          ([event]: [string]) => event === 'server_message',
        )
        const hasMaintenanceListener = calls.some(
          ([event]: [string]) => event === 'maintenance_mode',
        )

        expect(hasServerMessageListener).toBe(true)
        expect(hasMaintenanceListener).toBe(true)
      })

      // Reset mocks
      vi.resetModules()
      vi.doMock('@/config', () => ({
        config: {
          features: {
            websocket: true,
            debugMode: false,
          },
        },
      }))
    })
  })

  describe('Cleanup', () => {
    it('should cleanup event listeners on unmount', async () => {
      const unsubscribeFn = vi.fn()
      ;(websocketService.on as any).mockReturnValue(unsubscribeFn)

      setupAuthenticatedUser()

      const { unmount } = renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(websocketService.connect).toHaveBeenCalled()
      })

      unmount()

      // Should call unsubscribe for each registered listener
      expect(unsubscribeFn).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('should handle websocket disabled gracefully', async () => {
      // Clear previous mocks
      vi.clearAllMocks()
      ;(websocketService.connect as any).mockClear()

      // Mock config with websocket disabled
      vi.doMock('@/config', () => ({
        config: {
          features: {
            websocket: false,
            debugMode: false,
          },
        },
      }))

      // Clear module cache and reimport both modules
      vi.resetModules()

      // Import with disabled config
      const { WebSocketProvider: DisabledWebSocketProvider } = await import(
        '../WebSocketProvider'
      )

      setupAuthenticatedUser()

      // Use the re-imported provider
      const { container } = render(
        <TestProviders>
          <DisabledWebSocketProvider>
            <TestComponent />
          </DisabledWebSocketProvider>
        </TestProviders>,
      )

      // Wait a bit to ensure no connection is attempted
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Should not connect when websocket is disabled
      expect(websocketService.connect).not.toHaveBeenCalled()

      // Component should still render
      expect(
        container.querySelector('[data-testid="test-component"]'),
      ).toBeTruthy()

      // Restore original mock
      vi.resetModules()
      vi.doMock('@/config', () => ({
        config: {
          features: {
            websocket: true,
            debugMode: false,
          },
        },
      }))
    })

    it('should handle rapid auth changes', async () => {
      const { rerender } = renderWithProviders(<TestComponent />)

      // Rapid auth changes
      setupAuthenticatedUser()
      rerender(<TestComponent />)

      await waitFor(() => {
        expect(websocketService.connect).toHaveBeenCalled()
      })

      clearAuth()
      rerender(<TestComponent />)

      await waitFor(() => {
        expect(websocketService.disconnect).toHaveBeenCalled()
      })

      setupAuthenticatedUser()
      rerender(<TestComponent />)

      await waitFor(() => {
        // Should handle gracefully - connect called again
        expect(websocketService.connect).toHaveBeenCalledTimes(2)
      })
    })
  })
})
