import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../authStore';
import type { User } from '../../types/auth';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock as Storage;

describe('Auth Store', () => {
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    company: 'Test Company',
    role: 'user',
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

  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setAuth', () => {
    it('should set authentication data correctly', () => {
      useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe('access-token');
      expect(state.refreshToken).toBe('refresh-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle setting auth with minimal data', () => {
      const minimalUser = { ...mockUser };
      useAuthStore.getState().setAuth(minimalUser, 'token', '');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(minimalUser);
      expect(state.accessToken).toBe('token');
      expect(state.refreshToken).toBe('');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('updateUser', () => {
    it('should update user data', () => {
      // Set initial user
      useAuthStore.getState().setAuth(mockUser, 'token', 'refresh');

      // Update user
      const updates = { name: 'Updated Name', email: 'updated@example.com' };
      useAuthStore.getState().updateUser(updates);

      const state = useAuthStore.getState();
      expect(state.user).toEqual({ ...mockUser, ...updates });
      expect(state.user?.name).toBe('Updated Name');
      expect(state.user?.email).toBe('updated@example.com');
    });

    it('should not affect other state when updating user', () => {
      useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token');

      const updates = { email: 'new@example.com' };
      useAuthStore.getState().updateUser(updates);

      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('access-token');
      expect(state.refreshToken).toBe('refresh-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle update when no user exists', () => {
      useAuthStore.getState().updateUser({ name: 'Test' });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });
  });

  describe('updateCredits', () => {
    it('should update user credits', () => {
      useAuthStore.getState().setAuth(mockUser, 'token', 'refresh');

      useAuthStore.getState().updateCredits(3000);

      const state = useAuthStore.getState();
      expect(state.user?.credits).toBe(3000);
    });

    it('should not update credits if no user', () => {
      useAuthStore.getState().updateCredits(3000);

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should handle zero credits', () => {
      useAuthStore.getState().setAuth(mockUser, 'token', 'refresh');

      useAuthStore.getState().updateCredits(0);

      const state = useAuthStore.getState();
      expect(state.user?.credits).toBe(0);
    });

    it('should handle negative credits (edge case)', () => {
      useAuthStore.getState().setAuth(mockUser, 'token', 'refresh');

      useAuthStore.getState().updateCredits(-100);

      const state = useAuthStore.getState();
      expect(state.user?.credits).toBe(-100);
    });
  });

  describe('logout', () => {
    it('should clear all auth data', () => {
      // Set auth data
      useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token');

      // Logout
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle logout when already logged out', () => {
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('persistence', () => {
    it('should use correct storage key', () => {
      const persistOptions = useAuthStore.persist?.getOptions();
      expect(persistOptions?.name).toBe('auth-storage');
    });

    it('should have persistence configured', () => {
      expect(useAuthStore.persist).toBeDefined();
    });
  });

  describe('state updates', () => {
    it('should trigger subscribers on state change', () => {
      const listener = vi.fn();
      const unsubscribe = useAuthStore.subscribe(listener);

      useAuthStore.getState().setAuth(mockUser, 'token', 'refresh');

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });

    it('should batch multiple updates', () => {
      const listener = vi.fn();
      const unsubscribe = useAuthStore.subscribe(listener);

      useAuthStore.setState((state) => ({
        ...state,
        user: mockUser,
        accessToken: 'token',
        isAuthenticated: true,
      }));

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
    });
  });
});