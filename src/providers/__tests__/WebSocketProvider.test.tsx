import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { websocketService } from '@/services/websocket'
import {
  renderWithProviders,
  clearAuth,
  setupAuthenticatedUser,
} from '../../../tests/utils/test-helpers'

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
        expect(websocketService.connect).toHaveBeenCalledWith(
          'mock-access-token',
        )
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
        expect(websocketService.connect).toHaveBeenCalledWith(
          'mock-access-token',
        )
      })
    })

    it('should disconnect when user logs out', async () => {
      setupAuthenticatedUser()

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(websocketService.connect).toHaveBeenCalled()
      })

      // Simulate logout
      clearAuth()

      await waitFor(() => {
        expect(websocketService.disconnect).toHaveBeenCalled()
      })
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
      let authenticatedHandler: (data: { success: boolean }) => void

      ;(websocketService.on as any).mockImplementation(
        (event: string, handler: (data: { success: boolean }) => void) => {
          if (event === 'authenticated') authenticatedHandler = handler
          return vi.fn()
        },
      )

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      setupAuthenticatedUser()

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(websocketService.connect).toHaveBeenCalled()
      })

      // Test authenticated event
      if (authenticatedHandler!) {
        authenticatedHandler({ success: true })
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        '[WebSocketProvider] Authenticated:',
        true,
      )

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
        '[WebSocketProvider] Unauthorized:',
        'Invalid token',
      )

      consoleSpy.mockRestore()
    })
  })

  describe('Debug Mode', () => {
    it('should register debug listeners when enabled', async () => {
      // Mock config with debug mode enabled
      vi.doMock('@/config', () => ({
        config: {
          features: {
            websocket: true,
            debugMode: true,
          },
        },
      }))

      setupAuthenticatedUser()

      renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(websocketService.on).toHaveBeenCalledWith(
          'server_message',
          expect.any(Function),
        )
        expect(websocketService.on).toHaveBeenCalledWith(
          'maintenance_mode',
          expect.any(Function),
        )
      })
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
    it('should handle missing config gracefully', async () => {
      // Mock config with websocket disabled
      vi.doMock('@/config', () => ({
        config: {
          features: {
            websocket: false,
          },
        },
      }))

      setupAuthenticatedUser()

      renderWithProviders(<TestComponent />)

      // Should not connect when websocket is disabled
      expect(websocketService.connect).not.toHaveBeenCalled()
    })

    it('should handle rapid auth changes', async () => {
      renderWithProviders(<TestComponent />)

      // Rapid auth changes
      setupAuthenticatedUser()
      clearAuth()
      setupAuthenticatedUser()

      await waitFor(() => {
        // Should handle gracefully
        expect(websocketService.connect).toHaveBeenCalled()
        expect(websocketService.disconnect).toHaveBeenCalled()
      })
    })
  })
})
