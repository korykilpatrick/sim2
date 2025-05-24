import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/features/auth/services/authStore'
import { ApiError } from '@/api/types'

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
})

/**
 * Request interceptor that automatically adds the authentication token
 * to all outgoing requests if the user is authenticated.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
        const refreshToken = useAuthStore.getState().refreshToken
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.data
        const { user } = useAuthStore.getState()

        if (user) {
          useAuthStore.getState().setAuth(user, accessToken, newRefreshToken)
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
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
