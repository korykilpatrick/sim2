import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useRef } from 'react'

describe('useClickOutside', () => {
  let container: HTMLDivElement
  let element: HTMLDivElement
  let outsideElement: HTMLDivElement

  beforeEach(() => {
    // Create DOM elements for testing
    container = document.createElement('div')
    element = document.createElement('div')
    outsideElement = document.createElement('div')
    
    container.appendChild(element)
    container.appendChild(outsideElement)
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
    vi.restoreAllMocks()
  })

  it('should call handler when clicking outside', () => {
    const handler = vi.fn()
    
    const { result } = renderHook(() => useClickOutside(handler))
    
    // Attach ref to element
    Object.defineProperty(result.current, 'current', {
      writable: true,
      value: element,
    })

    // Click outside
    const event = new MouseEvent('mousedown', { bubbles: true })
    outsideElement.dispatchEvent(event)

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should not call handler when clicking inside', () => {
    const handler = vi.fn()
    
    const { result } = renderHook(() => useClickOutside(handler))
    
    // Attach ref to element
    Object.defineProperty(result.current, 'current', {
      writable: true,
      value: element,
    })

    // Click inside
    const event = new MouseEvent('mousedown', { bubbles: true })
    element.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
  })

  it('should handle touch events', () => {
    const handler = vi.fn()
    
    const { result } = renderHook(() => useClickOutside(handler))
    
    // Attach ref to element
    Object.defineProperty(result.current, 'current', {
      writable: true,
      value: element,
    })

    // Touch outside
    const event = new TouchEvent('touchstart', { bubbles: true })
    outsideElement.dispatchEvent(event)

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple refs', () => {
    const handler = vi.fn()
    const additionalElement = document.createElement('div')
    container.appendChild(additionalElement)

    const { result } = renderHook(() => {
      const additionalRef = useRef<HTMLElement>(null)
      Object.defineProperty(additionalRef, 'current', {
        writable: true,
        value: additionalElement,
      })
      
      return useClickOutside(handler, [additionalRef])
    })

    // Attach main ref
    Object.defineProperty(result.current, 'current', {
      writable: true,
      value: element,
    })

    // Click on additional ref element (should not trigger handler)
    const event1 = new MouseEvent('mousedown', { bubbles: true })
    additionalElement.dispatchEvent(event1)
    expect(handler).not.toHaveBeenCalled()

    // Click outside all refs
    const event2 = new MouseEvent('mousedown', { bubbles: true })
    outsideElement.dispatchEvent(event2)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should not call handler when ref is null', () => {
    const handler = vi.fn()
    
    const { result } = renderHook(() => useClickOutside(handler))
    
    // Don't attach ref (leave it null)

    // Click anywhere
    const event = new MouseEvent('mousedown', { bubbles: true })
    document.body.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
  })

  it('should cleanup event listeners on unmount', () => {
    const handler = vi.fn()
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
    
    const { unmount } = renderHook(() => useClickOutside(handler))
    
    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))
  })

  it('should handle clicks on nested elements', () => {
    const handler = vi.fn()
    const nestedElement = document.createElement('div')
    element.appendChild(nestedElement)
    
    const { result } = renderHook(() => useClickOutside(handler))
    
    // Attach ref to element
    Object.defineProperty(result.current, 'current', {
      writable: true,
      value: element,
    })

    // Click on nested element (should not trigger handler)
    const event = new MouseEvent('mousedown', { bubbles: true })
    nestedElement.dispatchEvent(event)

    expect(handler).not.toHaveBeenCalled()
  })

  it('should update handler when it changes', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    
    const { result, rerender } = renderHook(
      ({ handler }) => useClickOutside(handler),
      {
        initialProps: { handler: handler1 },
      }
    )
    
    // Attach ref to element
    Object.defineProperty(result.current, 'current', {
      writable: true,
      value: element,
    })

    // Click outside with first handler
    const event1 = new MouseEvent('mousedown', { bubbles: true })
    outsideElement.dispatchEvent(event1)
    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).not.toHaveBeenCalled()

    // Update handler
    rerender({ handler: handler2 })

    // Click outside with second handler
    const event2 = new MouseEvent('mousedown', { bubbles: true })
    outsideElement.dispatchEvent(event2)
    expect(handler1).toHaveBeenCalledTimes(1) // Still 1
    expect(handler2).toHaveBeenCalledTimes(1)
  })

  it('should handle empty additional refs array', () => {
    const handler = vi.fn()
    
    const { result } = renderHook(() => useClickOutside(handler, []))
    
    // Attach ref to element
    Object.defineProperty(result.current, 'current', {
      writable: true,
      value: element,
    })

    // Click outside
    const event = new MouseEvent('mousedown', { bubbles: true })
    outsideElement.dispatchEvent(event)

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should handle null additional refs', () => {
    const handler = vi.fn()
    
    const { result } = renderHook(() => {
      const nullRef = useRef<HTMLElement>(null)
      return useClickOutside(handler, [nullRef])
    })
    
    // Attach main ref
    Object.defineProperty(result.current, 'current', {
      writable: true,
      value: element,
    })

    // Click outside
    const event = new MouseEvent('mousedown', { bubbles: true })
    outsideElement.dispatchEvent(event)

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should work with generic element types', () => {
    const handler = vi.fn()
    const buttonElement = document.createElement('button')
    container.appendChild(buttonElement)
    
    const { result } = renderHook(() => useClickOutside<HTMLButtonElement>(handler))
    
    // Attach ref to button element
    Object.defineProperty(result.current, 'current', {
      writable: true,
      value: buttonElement,
    })

    // Click on button (inside)
    const event1 = new MouseEvent('mousedown', { bubbles: true })
    buttonElement.dispatchEvent(event1)
    expect(handler).not.toHaveBeenCalled()

    // Click outside button
    const event2 = new MouseEvent('mousedown', { bubbles: true })
    outsideElement.dispatchEvent(event2)
    expect(handler).toHaveBeenCalledTimes(1)
  })
})