import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../useAuth';
import { authApi } from '../../services/auth';
import { useAuthStore } from '../../services/authStore';
import { useToast } from '@/hooks/useToast';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '../../types/auth';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: vi.fn(),
}));

vi.mock('../../services/auth', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

describe('useAuth Hook', () => {
  const mockNavigate = vi.fn();
  const mockShowToast = vi.fn();
  let testQueryClient: QueryClient;

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    company: 'Test Company',
    role: 'user',
    credits: 1000,
    isActive: true,
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        sms: false,
        push: false,
      },
      defaultView: 'dashboard',
    },
    subscription: {
      plan: 'enterprise',
      credits: 5000,
      creditsUsed: 1000,
      renewalDate: '2025-02-25',
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-25T00:00:00Z',
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast, removeToast: vi.fn() });

    // Reset auth store
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return auth state from store', () => {
      useAuthStore.setState({
        user: mockUser,
        accessToken: 'token',
        refreshToken: 'refresh',
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe('token');
    });

    it('should return unauthenticated state when not logged in', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBeNull();
    });
  });

  describe('login', () => {
    const loginCredentials: LoginCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login', async () => {
      const authResponse = {
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      vi.mocked(authApi.login).mockResolvedValueOnce(authResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.login(loginCredentials);
      });

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith(loginCredentials);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'Successfully logged in!',
        });
      });

      // Check store was updated
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe('access-token');
      expect(state.refreshToken).toBe('refresh-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle login failure', async () => {
      const error = {
        response: {
          data: {
            error: {
              message: 'Invalid credentials',
            },
          },
        },
      };
      vi.mocked(authApi.login).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.login(loginCredentials);
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'Invalid credentials',
        });
        expect(mockNavigate).not.toHaveBeenCalled();
      });

      // Check store was not updated
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle network errors', async () => {
      vi.mocked(authApi.login).mockRejectedValueOnce({ response: undefined });

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.login(loginCredentials);
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'Login failed',
        });
      });
    });
  });

  describe('register', () => {
    const registerData: RegisterData = {
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
      company: 'New Company',
    };

    it('should successfully register', async () => {
      const authResponse = {
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      vi.mocked(authApi.register).mockResolvedValueOnce(authResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.register(registerData);
      });

      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalledWith(registerData);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'Account created successfully!',
        });
      });

      // Check store was updated
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle registration failure', async () => {
      const error = {
        response: {
          data: {
            error: {
              message: 'Email already exists',
            },
          },
        },
      };
      vi.mocked(authApi.register).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.register(registerData);
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'Email already exists',
        });
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      useAuthStore.setState({
        user: mockUser,
        accessToken: 'token',
        refreshToken: 'refresh',
        isAuthenticated: true,
      });
    });

    it('should successfully logout', async () => {
      vi.mocked(authApi.logout).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      await waitFor(() => {
        expect(authApi.logout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
        expect(mockShowToast).toHaveBeenCalledWith({
          type: 'success',
          message: 'Successfully logged out',
        });
      });

      // Check store was cleared
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle logout errors gracefully', async () => {
      vi.mocked(authApi.logout).mockRejectedValueOnce(new Error('Logout failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      await waitFor(() => {
        // Should still clear local state even if API fails
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });

      // Store should still be cleared
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('loading states', () => {
    it('should track login loading state', async () => {
      let resolveLogin: (value: unknown) => void;
      const loginPromise = new Promise<AuthResponse>((resolve) => {
        resolveLogin = resolve as (value: unknown) => void;
      });
      vi.mocked(authApi.login).mockReturnValueOnce(loginPromise);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoggingIn).toBe(false);

      act(() => {
        result.current.login({ email: 'test@example.com', password: 'pass' });
      });

      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(true);
      });

      await act(async () => {
        resolveLogin!({
          user: mockUser,
          accessToken: 'token',
          refreshToken: 'refresh',
        });
      });

      await waitFor(() => {
        expect(result.current.isLoggingIn).toBe(false);
      });
    });

    it('should track register loading state', async () => {
      let resolveRegister: (value: unknown) => void;
      const registerPromise = new Promise<AuthResponse>((resolve) => {
        resolveRegister = resolve as (value: unknown) => void;
      });
      vi.mocked(authApi.register).mockReturnValueOnce(registerPromise);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isRegistering).toBe(false);

      act(() => {
        result.current.register({
          email: 'test@example.com',
          password: 'pass',
          name: 'Test',
          company: 'Company',
        });
      });

      await waitFor(() => {
        expect(result.current.isRegistering).toBe(true);
      });

      await act(async () => {
        resolveRegister!({
          user: mockUser,
          accessToken: 'token',
          refreshToken: 'refresh',
        });
      });

      await waitFor(() => {
        expect(result.current.isRegistering).toBe(false);
      });
    });

    it('should track logout loading state', async () => {
      let resolveLogout: (value: unknown) => void;
      const logoutPromise = new Promise((resolve) => {
        resolveLogout = resolve;
      });
      vi.mocked(authApi.logout).mockReturnValueOnce(logoutPromise);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoggingOut).toBe(false);

      act(() => {
        result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.isLoggingOut).toBe(true);
      });

      await act(async () => {
        resolveLogout!(undefined);
      });

      await waitFor(() => {
        expect(result.current.isLoggingOut).toBe(false);
      });
    });
  });

  describe('exposed properties', () => {
    it('should expose isLoadingUser as false', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.isLoadingUser).toBe(false);
    });

    it('should expose auth token', () => {
      useAuthStore.setState({
        user: mockUser,
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.token).toBe('test-token');
    });
  });
});