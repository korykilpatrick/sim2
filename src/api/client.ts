import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/features/auth/services/authStore'
import { ApiError } from '@/api/types'
import { getCSRFToken } from '@/utils/csrf'

/**
 * Base URL for all API requests.
 * @internal
 */
const API_BASE_URL = '/api/v1'

/**
 * Pre-configured axios instance for API requests.
 * Automatically handles authentication tokens and token refresh.
 *
 * @example
 * // Making an authenticated API request
 * const response = await apiClient.get('/users/profile');
 *
 * @example
 * // POST request with data
 * const result = await apiClient.post('/vessels/track', { vesselId, criteria });
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
})

/**
 * Request interceptor that adds CSRF tokens to state-changing requests.
 * Authentication is handled via httpOnly cookies automatically.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add CSRF token for state-changing requests
    if (
      ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
        config.method?.toUpperCase() || '',
      )
    ) {
      const csrfToken = getCSRFToken()
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

/**
 * Response interceptor that handles authentication errors.
 * Automatically attempts to refresh the access token on 401 errors.
 * If refresh fails, logs out the user and redirects to login page.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh using cookies (no need to send refresh token in body)
        await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true, // Include cookies
          },
        )

        // Retry the original request - cookies will be updated automatically
        return apiClient(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)
