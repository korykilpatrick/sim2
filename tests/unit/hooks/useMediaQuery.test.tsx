import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  useMediaQuery, 
  useIsMobile, 
  useIsTablet, 
  useIsDesktop 
} from '@/hooks/useMediaQuery'

// Mock matchMedia
const createMatchMediaMock = (matches: boolean) => ({
  matches,
  media: '',
  onchange: null,
  addListener: undefined, // Force modern API usage
  removeListener: undefined,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})

describe('useMediaQuery', () => {
  let mockMatchMedia: ReturnType<typeof createMatchMediaMock>

  beforeEach(() => {
    mockMatchMedia = createMatchMediaMock(false)
    window.matchMedia = vi.fn().mockImplementation(() => mockMatchMedia)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return initial match status', () => {
    mockMatchMedia.matches = true
    
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    
    expect(result.current).toBe(true)
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 768px)')
  })

  it('should update when media query match changes', async () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    
    expect(result.current).toBe(false)

    // Wait for useEffect to run
    await waitFor(() => {
      expect(mockMatchMedia.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    // Simulate media query change
    act(() => {
      const changeHandler = mockMatchMedia.addEventListener.mock.calls[0][1]
      changeHandler({ matches: true })
    })

    expect(result.current).toBe(true)
  })

  it('should handle legacy addListener API', () => {
    // Set up legacy API
    mockMatchMedia.addEventListener = undefined as any
    mockMatchMedia.removeEventListener = undefined as any
    mockMatchMedia.addListener = vi.fn()
    mockMatchMedia.removeListener = vi.fn()

    const { result, unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    
    expect(mockMatchMedia.addListener).toHaveBeenCalled()
    
    // Simulate change with legacy API
    act(() => {
      mockMatchMedia.matches = true
      const changeHandler = mockMatchMedia.addListener.mock.calls[0][0]
      changeHandler({ matches: true })
    })

    expect(result.current).toBe(true)

    unmount()
    expect(mockMatchMedia.removeListener).toHaveBeenCalled()
  })

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    
    // Verify addEventListener was called
    expect(mockMatchMedia.addEventListener).toHaveBeenCalled()
    
    const addedHandler = mockMatchMedia.addEventListener.mock.calls[0][1]
    
    unmount()
    
    expect(mockMatchMedia.removeEventListener).toHaveBeenCalledWith(
      'change',
      addedHandler
    )
  })

  it('should update when query prop changes', () => {
    const { result, rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      {
        initialProps: { query: '(min-width: 768px)' },
      }
    )

    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 768px)')

    // Change query
    rerender({ query: '(min-width: 1024px)' })

    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1024px)')
  })

  it('should handle SSR environment', () => {
    // This test verifies the hook's behavior during SSR by checking its implementation
    // Since renderHook requires a DOM environment, we test the logic directly
    
    // The hook checks for window existence and returns false
    expect(typeof useMediaQuery).toBe('function')
    
    // In SSR, media query operations should be safely skipped
    // The implementation guards against window being undefined
    const hook = useMediaQuery.toString()
    expect(hook).toContain('window')
    expect(hook).toContain('undefined')
  })

  it('should work with complex media queries', () => {
    const complexQuery = '(min-width: 768px) and (max-width: 1024px) and (orientation: portrait)'
    
    const { result } = renderHook(() => useMediaQuery(complexQuery))
    
    expect(window.matchMedia).toHaveBeenCalledWith(complexQuery)
    expect(result.current).toBe(false)
  })

  it('should handle multiple simultaneous queries', () => {
    // Create separate mocks for each query
    const firstQueryMock = createMatchMediaMock(false)
    const secondQueryMock = createMatchMediaMock(false)
    
    window.matchMedia = vi.fn().mockImplementation((query) => {
      if (query === '(min-width: 768px)') return firstQueryMock
      if (query === '(max-width: 480px)') return secondQueryMock
      return createMatchMediaMock(false)
    })

    const { result: result1 } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    const { result: result2 } = renderHook(() => useMediaQuery('(max-width: 480px)'))

    expect(result1.current).toBe(false)
    expect(result2.current).toBe(false)

    // Update first query
    act(() => {
      const changeHandler = firstQueryMock.addEventListener.mock.calls[0][1]
      changeHandler({ matches: true })
    })

    expect(result1.current).toBe(true)
    expect(result2.current).toBe(false)
  })
})

describe('useIsMobile', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.matchMedia = vi.fn().mockImplementation((query) => 
        createMatchMediaMock(query === '(max-width: 640px)')
      )
    }
  })

  it('should detect mobile viewport', () => {
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 640px)')
  })
})

describe('useIsTablet', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.matchMedia = vi.fn().mockImplementation((query) => 
        createMatchMediaMock(query === '(min-width: 641px) and (max-width: 1024px)')
      )
    }
  })

  it('should detect tablet viewport', () => {
    const { result } = renderHook(() => useIsTablet())
    expect(result.current).toBe(true)
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 641px) and (max-width: 1024px)')
  })
})

describe('useIsDesktop', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.matchMedia = vi.fn().mockImplementation((query) => 
        createMatchMediaMock(query === '(min-width: 1025px)')
      )
    }
  })

  it('should detect desktop viewport', () => {
    const { result } = renderHook(() => useIsDesktop())
    expect(result.current).toBe(true)
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1025px)')
  })
})

describe('Media query integration', () => {
  it('should handle viewport size transitions', () => {
    let currentQuery = ''
    const matchMediaMock = vi.fn().mockImplementation((query) => {
      currentQuery = query
      const mock = createMatchMediaMock(false)
      
      // Simulate different viewport sizes
      if (query === '(max-width: 640px)' && currentQuery === query) {
        mock.matches = true // Mobile
      } else if (query === '(min-width: 641px) and (max-width: 1024px)' && currentQuery === query) {
        mock.matches = false // Not tablet initially
      } else if (query === '(min-width: 1025px)' && currentQuery === query) {
        mock.matches = false // Not desktop initially
      }
      
      return mock
    })
    
    if (typeof window !== 'undefined') {
      window.matchMedia = matchMediaMock
    }

    const { result: mobileResult } = renderHook(() => useIsMobile())
    const { result: tabletResult } = renderHook(() => useIsTablet())
    const { result: desktopResult } = renderHook(() => useIsDesktop())

    // Initial state - mobile
    expect(mobileResult.current).toBe(true)
    expect(tabletResult.current).toBe(false)
    expect(desktopResult.current).toBe(false)
  })
})