import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/useToast'
import { authApi } from '../services/auth'
import { useAuthStore, authSelectors } from '../services/authStore'
import { LoginCredentials, RegisterData } from '../types/auth'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/api/types'
import { authKeys } from './'
import { fetchCSRFToken, clearCSRFToken } from '@/utils/csrf'

/**
 * Authentication hook providing login, register, logout functionality.
 * Manages authentication state and user data with React Query.
 *
 * @returns Authentication methods and state
 *
 * @example
 * const { login, logout, user, isAuthenticated } = useAuth();
 *
 * // Login
 * login({ email: 'user@example.com', password: 'password' });
 *
 * // Check auth state
 * if (isAuthenticated) {
 *   console.log('Logged in as:', user.name);
 * }
 */
export function useAuth() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const user = useAuthStore(authSelectors.user)
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated)
  const setAuth = useAuthStore(authSelectors.setAuth)
  const logoutStore = useAuthStore(authSelectors.logout)

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: async (response) => {
      const { user } = response
      setAuth(user)
      queryClient.setQueryData(authKeys.user(), user)
      // Fetch new CSRF token after login
      await fetchCSRFToken()
      showToast({ type: 'success', message: 'Successfully logged in!' })
      navigate('/dashboard')
    },
    onError: (error: AxiosError<ApiResponse>) => {
      showToast({
        type: 'error',
        message: error.response?.data?.error?.message || 'Login failed',
      })
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (response) => {
      const { user } = response
      setAuth(user)
      queryClient.setQueryData(authKeys.user(), user)
      showToast({ type: 'success', message: 'Account created successfully!' })
      navigate('/dashboard')
    },
    onError: (error: AxiosError<ApiResponse>) => {
      showToast({
        type: 'error',
        message: error.response?.data?.error?.message || 'Registration failed',
      })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logoutStore()
      queryClient.clear()
      clearCSRFToken()
      showToast({ type: 'success', message: 'Successfully logged out' })
      navigate('/login')
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      logoutStore()
      queryClient.clear()
      navigate('/login')
    },
  })

  return {
    user,
    isAuthenticated,
    isLoadingUser: false,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}
