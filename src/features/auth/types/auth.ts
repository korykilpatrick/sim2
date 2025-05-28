/**
 * User preferences for theme and notifications.
 */
export interface UserPreferences {
  /** UI theme preference */
  theme: 'light' | 'dark'
  /** Notification settings */
  notifications: {
    /** Email notifications enabled */
    email: boolean
    /** SMS notifications enabled */
    sms: boolean
    /** Push notifications enabled */
    push: boolean
  }
  /** Default dashboard view */
  defaultView: 'dashboard' | 'vessels' | 'areas' | 'reports'
}

/**
 * User subscription information.
 */
export interface UserSubscription {
  /** Subscription plan type */
  plan: 'free' | 'basic' | 'professional' | 'enterprise'
  /** Total available credits */
  credits: number
  /** Credits used in current period */
  creditsUsed: number
  /** ISO date string for subscription renewal */
  renewalDate: string
}

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
  /** Department within company */
  department?: string
  /** User's phone number */
  phone?: string
  /** Avatar URL */
  avatar?: string
  /** User's role determining access permissions */
  role: 'user' | 'admin'
  /**
   * Available credits for vessel tracking
   * @deprecated Use creditStore for credit balance - this field will be removed in v2.0
   */
  credits: number
  /** User preferences */
  preferences?: UserPreferences
  /** Subscription information */
  subscription?: UserSubscription
  /** ISO timestamp of account creation */
  createdAt: string
  /** ISO timestamp of last profile update */
  updatedAt: string
  /** ISO timestamp of last login */
  lastLogin?: string
  /** Whether the account is active */
  isActive: boolean
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
 * Returned by login and register operations.
 * Note: Tokens are stored in httpOnly cookies for security.
 */
export interface AuthResponse {
  /** Authenticated user data */
  user: User
}
