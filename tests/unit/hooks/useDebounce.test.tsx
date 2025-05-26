import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDebounce } from '@/hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    expect(result.current).toBe('initial')

    // Update value
    rerender({ value: 'updated', delay: 500 })
    
    // Value should not change immediately
    expect(result.current).toBe('initial')

    // Fast-forward time by less than delay
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe('initial')

    // Fast-forward time to complete delay
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe('updated')
  })

  it('should cancel previous timeout on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    // Rapid updates
    rerender({ value: 'update1', delay: 500 })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    
    rerender({ value: 'update2', delay: 500 })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    
    rerender({ value: 'update3', delay: 500 })
    
    // Only the last update should take effect
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('update3')
  })

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    // Update value with different delay
    rerender({ value: 'updated', delay: 1000 })
    
    // Fast-forward by original delay
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('initial')

    // Fast-forward to new delay
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('updated')
  })

  it('should work with different data types', () => {
    // Number
    const { result: numberResult } = renderHook(() => useDebounce(123, 100))
    expect(numberResult.current).toBe(123)

    // Object
    const obj = { foo: 'bar' }
    const { result: objectResult } = renderHook(() => useDebounce(obj, 100))
    expect(objectResult.current).toBe(obj)

    // Array
    const arr = [1, 2, 3]
    const { result: arrayResult } = renderHook(() => useDebounce(arr, 100))
    expect(arrayResult.current).toBe(arr)

    // Boolean
    const { result: boolResult } = renderHook(() => useDebounce(true, 100))
    expect(boolResult.current).toBe(true)

    // Null
    const { result: nullResult } = renderHook(() => useDebounce(null, 100))
    expect(nullResult.current).toBe(null)
  })

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    
    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    rerender({ value: 'updated', delay: 500 })
    
    unmount()
    
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 0 },
      }
    )

    rerender({ value: 'updated', delay: 0 })
    
    // Should update immediately with zero delay
    act(() => {
      vi.advanceTimersByTime(0)
    })
    expect(result.current).toBe('updated')
  })

  it('should maintain reference stability for objects when value does not change', () => {
    const obj = { count: 1 }
    const { result, rerender } = renderHook(() => useDebounce(obj, 500))

    const firstReference = result.current

    // Trigger re-render without changing value
    rerender()

    expect(result.current).toBe(firstReference)
  })
})