import '@testing-library/jest-dom'
import { expect, afterEach, vi, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { server } from './utils/api-mocks'
import { configureApiClientForTests } from './utils/test-api-client'

expect.extend(matchers)

// Configure environment for MSW
beforeAll(() => {
  // Configure API client for tests
  configureApiClientForTests()
  
  // Set up a base URL for tests
  // This ensures axios requests in JSDOM have a proper origin
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '',
      hash: ''
    },
    writable: true
  })

  // Start MSW server
  server.listen({ 
    onUnhandledRequest: 'error'
  })
  
  // Request logging disabled by default - uncomment for debugging
  // server.events.on('request:start', ({ request }) => {
  //   console.log('MSW intercepted:', request.method, request.url)
  // })
  // 
  // server.events.on('request:unhandled', ({ request }) => {
  //   console.log('MSW missed:', request.method, request.url)
  // })
  // 
  // server.events.on('request:match', ({ request, requestId }) => {
  //   console.log('MSW matched:', request.method, request.url, 'id:', requestId)
  // })
})

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers()
  cleanup()
})

// Stop MSW server after all tests
afterAll(() => server.close())

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))