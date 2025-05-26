import { apiClient } from '@/api/client'

// Configure axios for tests to ensure MSW can intercept requests
export function configureApiClientForTests() {
  // Ensure requests use relative URLs (no protocol/host)
  // This allows MSW to intercept them properly
  apiClient.defaults.baseURL = '/api/v1'
  
  // Remove any request interceptors that might interfere
  apiClient.interceptors.request.handlers = []
  
  // Add a simple interceptor that logs requests in tests
  apiClient.interceptors.request.use(
    (config) => {
      console.log('Test API request:', config.method?.toUpperCase(), config.url)
      return config
    },
    (error) => {
      console.error('Test API request error:', error)
      return Promise.reject(error)
    }
  )
}