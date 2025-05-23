/**
 * Represents an authenticated user in the system.
 */
export interface User {
  /** Unique user identifier */
  id: string
  /** User's email address (used for login) */
  email: string
  /** User's display name */
  name: string
  /** Company/organization name */
  company?: string
  /** User's role determining access permissions */
  role: 'user' | 'admin'
  /** Available credits for vessel tracking */
  credits: number
  /** ISO timestamp of account creation */
  createdAt: string
  /** ISO timestamp of last profile update */
  updatedAt: string
}

/**
 * Global authentication state managed by auth store.
 */
export interface AuthState {
  /** Currently authenticated user, null if not logged in */
  user: User | null
  /** Whether a user is currently authenticated */
  isAuthenticated: boolean
  /** Whether authentication operations are in progress */
  isLoading: boolean
}

/**
 * Credentials required for user login.
 */
export interface LoginCredentials {
  /** User's email address */
  email: string
  /** User's password */
  password: string
}

/**
 * Data required for new user registration.
 * Extends login credentials with additional profile information.
 */
export interface RegisterData extends LoginCredentials {
  /** User's full name */
  name: string
  /** Optional company/organization name */
  company?: string
}

/**
 * Response data from successful authentication endpoints.
 * Returned by login, register, and token refresh operations.
 */
export interface AuthResponse {
  /** Authenticated user data */
  user: User
  /** JWT access token for API requests */
  accessToken: string
  /** JWT refresh token for obtaining new access tokens */
  refreshToken: string
}
