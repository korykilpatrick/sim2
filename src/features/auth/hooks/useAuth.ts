import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../services/auth'
import { useAuthStore } from '../services/authStore'
import { LoginCredentials, RegisterData } from '../types/auth'

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
  const { setAuth, logout: logoutStore, isAuthenticated, user } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data
      setAuth(user, accessToken, refreshToken)
      queryClient.setQueryData(['auth', 'user'], user)
      toast.success('Successfully logged in!')
      navigate('/dashboard')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Login failed')
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data
      setAuth(user, accessToken, refreshToken)
      queryClient.setQueryData(['auth', 'user'], user)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Registration failed')
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logoutStore()
      queryClient.clear()
      toast.success('Successfully logged out')
      navigate('/login')
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      logoutStore()
      queryClient.clear()
      navigate('/login')
    },
  })

  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser()
      return response.data
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    user: currentUser || user,
    isAuthenticated,
    isLoadingUser,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}
