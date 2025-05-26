import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useToast, useToasts, useToastStore } from '@/hooks/useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Reset the toast store state before each test
    useToastStore.setState({ toasts: [] })
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.restoreAllMocks()
    // Clear the store after each test
    useToastStore.setState({ toasts: [] })
  })

  it('should add toast with unique id', () => {
    const { result: toastResult } = renderHook(() => useToast())
    const { result: toastsResult } = renderHook(() => useToasts())

    act(() => {
      toastResult.current.showToast({
        type: 'success',
        message: 'Test toast',
      })
    })

    expect(toastsResult.current).toHaveLength(1)
    expect(toastsResult.current[0]).toMatchObject({
      type: 'success',
      message: 'Test toast',
      id: expect.stringMatching(/^toast-\d+$/),
    })
  })

  it('should handle multiple toasts', () => {
    const { result: toastResult } = renderHook(() => useToast())
    const { result: toastsResult } = renderHook(() => useToasts())

    act(() => {
      toastResult.current.showToast({ type: 'info', message: 'Info toast' })
      toastResult.current.showToast({ type: 'error', message: 'Error toast' })
      toastResult.current.showToast({ type: 'warning', message: 'Warning toast' })
    })

    expect(toastsResult.current).toHaveLength(3)
    expect(toastsResult.current[0].type).toBe('info')
    expect(toastsResult.current[1].type).toBe('error')
    expect(toastsResult.current[2].type).toBe('warning')
  })

  it('should auto-remove toast after default duration', () => {
    const { result: toastResult } = renderHook(() => useToast())
    const { result: toastsResult } = renderHook(() => useToasts())

    act(() => {
      toastResult.current.showToast({
        type: 'success',
        message: 'Auto remove toast',
      })
    })

    expect(toastsResult.current).toHaveLength(1)

    // Advance time by default duration (5000ms)
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(toastsResult.current).toHaveLength(0)
  })

  it('should auto-remove toast after custom duration', () => {
    const { result: toastResult } = renderHook(() => useToast())
    const { result: toastsResult } = renderHook(() => useToasts())

    act(() => {
      toastResult.current.showToast({
        type: 'info',
        message: 'Custom duration toast',
        duration: 2000,
      })
    })

    expect(toastsResult.current).toHaveLength(1)

    // Advance time by less than custom duration
    act(() => {
      vi.advanceTimersByTime(1500)
    })
    expect(toastsResult.current).toHaveLength(1)

    // Advance time to complete custom duration
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(toastsResult.current).toHaveLength(0)
  })

  it('should not auto-remove toast when duration is 0', () => {
    const { result: toastResult } = renderHook(() => useToast())
    const { result: toastsResult } = renderHook(() => useToasts())

    act(() => {
      toastResult.current.showToast({
        type: 'error',
        message: 'Permanent toast',
        duration: 0,
      })
    })

    expect(toastsResult.current).toHaveLength(1)

    // Advance time significantly
    act(() => {
      vi.advanceTimersByTime(10000)
    })

    // Toast should still be there
    expect(toastsResult.current).toHaveLength(1)
  })

  it('should manually remove toast', () => {
    const { result: toastResult } = renderHook(() => useToast())
    const { result: toastsResult } = renderHook(() => useToasts())

    let toastId: string = ''

    act(() => {
      toastResult.current.showToast({
        type: 'info',
        message: 'Manual remove toast',
        duration: 0, // Permanent
      })
    })

    // Get the toast ID after the state update
    toastId = toastsResult.current[0].id

    expect(toastsResult.current).toHaveLength(1)

    act(() => {
      toastResult.current.removeToast(toastId)
    })

    expect(toastsResult.current).toHaveLength(0)
  })

  it('should handle removing non-existent toast', () => {
    const { result: toastResult } = renderHook(() => useToast())
    const { result: toastsResult } = renderHook(() => useToasts())

    // Should not throw
    act(() => {
      toastResult.current.removeToast('non-existent-id')
    })

    expect(toastsResult.current).toHaveLength(0)
  })

  it('should maintain toast order', () => {
    const { result: toastResult } = renderHook(() => useToast())
    const { result: toastsResult } = renderHook(() => useToasts())

    act(() => {
      toastResult.current.showToast({ type: 'info', message: 'First' })
      toastResult.current.showToast({ type: 'success', message: 'Second' })
      toastResult.current.showToast({ type: 'error', message: 'Third' })
    })

    expect(toastsResult.current.map(t => t.message)).toEqual([
      'First',
      'Second',
      'Third',
    ])
  })

  it('should share state between multiple hook instances', () => {
    const { result: toast1 } = renderHook(() => useToast())
    const { result: toast2 } = renderHook(() => useToast())
    const { result: toasts1 } = renderHook(() => useToasts())
    const { result: toasts2 } = renderHook(() => useToasts())

    act(() => {
      toast1.current.showToast({ type: 'info', message: 'From hook 1' })
    })

    // Both instances should see the same toast
    expect(toasts1.current).toHaveLength(1)
    expect(toasts2.current).toHaveLength(1)
    expect(toasts1.current[0]).toEqual(toasts2.current[0])

    act(() => {
      toast2.current.showToast({ type: 'success', message: 'From hook 2' })
    })

    // Both instances should see both toasts
    expect(toasts1.current).toHaveLength(2)
    expect(toasts2.current).toHaveLength(2)
  })

  it('should handle rapid toast creation', () => {
    const { result: toastResult } = renderHook(() => useToast())
    const { result: toastsResult } = renderHook(() => useToasts())

    // Mock Date.now to ensure unique IDs
    let mockTime = 1000
    vi.spyOn(Date, 'now').mockImplementation(() => mockTime++)

    act(() => {
      for (let i = 0; i < 10; i++) {
        toastResult.current.showToast({
          type: 'info',
          message: `Toast ${i}`,
          duration: 1000,
        })
      }
    })

    expect(toastsResult.current).toHaveLength(10)

    // All toasts should have unique IDs
    const ids = toastsResult.current.map(t => t.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(10)
  })

  it('should handle all toast types', () => {
    const { result: toastResult } = renderHook(() => useToast())
    const { result: toastsResult } = renderHook(() => useToasts())

    const types = ['success', 'error', 'warning', 'info'] as const

    act(() => {
      types.forEach(type => {
        toastResult.current.showToast({
          type,
          message: `${type} message`,
        })
      })
    })

    expect(toastsResult.current).toHaveLength(4)
    types.forEach((type, index) => {
      expect(toastsResult.current[index].type).toBe(type)
    })
  })

  it('should handle toast with same message but different types', () => {
    const { result: toastResult } = renderHook(() => useToast())
    const { result: toastsResult } = renderHook(() => useToasts())

    // Mock Date.now to ensure different IDs
    let mockTime = 2000
    vi.spyOn(Date, 'now').mockImplementation(() => mockTime++)

    act(() => {
      toastResult.current.showToast({ type: 'info', message: 'Same message' })
      toastResult.current.showToast({ type: 'error', message: 'Same message' })
    })

    expect(toastsResult.current).toHaveLength(2)
    expect(toastsResult.current[0].type).toBe('info')
    expect(toastsResult.current[1].type).toBe('error')
    expect(toastsResult.current[0].id).not.toBe(toastsResult.current[1].id)
  })

  it('should clean up timeouts when removing toast manually', () => {
    const { result: toastResult } = renderHook(() => useToast())
    const { result: toastsResult } = renderHook(() => useToasts())

    let toastId: string = ''

    act(() => {
      toastResult.current.showToast({
        type: 'info',
        message: 'Will be removed',
        duration: 5000,
      })
    })

    // Get the toast ID after the state update
    toastId = toastsResult.current[0].id

    // Remove before auto-removal
    act(() => {
      toastResult.current.removeToast(toastId)
    })

    // Advance time to check if timeout was cleared
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    // Toast should not reappear
    expect(toastsResult.current).toHaveLength(0)
  })
})