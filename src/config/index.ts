/**
 * Application configuration from environment variables
 * Provides type-safe access to environment configuration
 */

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key]
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value || defaultValue || ''
}

const getEnvBool = (key: string, defaultValue = false): boolean => {
  const value = import.meta.env[key]
  if (value === undefined) return defaultValue
  return value === 'true' || value === '1'
}

const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = import.meta.env[key]
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
    return defaultValue
  }
  const parsed = Number(value)
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`)
  }
  return parsed
}

export const config = {
  // API Configuration
  api: {
    baseUrl: getEnvVar('VITE_API_URL', 'http://localhost:3001/api/v1'),
    timeout: getEnvNumber('VITE_API_TIMEOUT_MS', 30000),
  },

  // WebSocket Configuration
  websocketUrl: getEnvVar('VITE_WEBSOCKET_URL', 'ws://localhost:3001'),

  // Authentication
  auth: {
    tokenKey: getEnvVar('VITE_AUTH_TOKEN_KEY', 'sim_auth_token'),
    refreshTokenKey: getEnvVar('VITE_REFRESH_TOKEN_KEY', 'sim_refresh_token'),
    sessionTimeoutMinutes: getEnvNumber('VITE_SESSION_TIMEOUT_MINUTES', 30),
  },

  // Error Tracking
  sentry: {
    dsn: getEnvVar('VITE_SENTRY_DSN', ''),
    environment: getEnvVar('VITE_SENTRY_ENVIRONMENT', 'development'),
    tracesSampleRate: getEnvNumber('VITE_SENTRY_TRACES_SAMPLE_RATE', 0.1),
    enabled: !!getEnvVar('VITE_SENTRY_DSN', ''),
  },

  // Analytics
  analytics: {
    id: getEnvVar('VITE_ANALYTICS_ID', ''),
    enabled: getEnvBool('VITE_ANALYTICS_ENABLED', false),
  },

  // Feature Flags
  features: {
    mockApi: getEnvBool('VITE_ENABLE_MOCK_API', true),
    debugMode: getEnvBool('VITE_ENABLE_DEBUG_MODE', true),
    websocket: getEnvBool('VITE_ENABLE_WEBSOCKET', false),
  },

  // Map Configuration
  map: {
    mapboxToken: getEnvVar('VITE_MAPBOX_ACCESS_TOKEN', ''),
    defaultCenter: {
      lat: getEnvNumber('VITE_DEFAULT_MAP_CENTER_LAT', 0),
      lng: getEnvNumber('VITE_DEFAULT_MAP_CENTER_LNG', 0),
    },
    defaultZoom: getEnvNumber('VITE_DEFAULT_MAP_ZOOM', 2),
  },

  // External Services
  external: {
    stripePublicKey: getEnvVar('VITE_STRIPE_PUBLIC_KEY', ''),
    intercomAppId: getEnvVar('VITE_INTERCOM_APP_ID', ''),
  },

  // Application Settings
  app: {
    name: getEnvVar('VITE_APP_NAME', 'SIM - Synmax Intelligence for Maritime'),
    version: getEnvVar('VITE_APP_VERSION', '0.0.1'),
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  },

  // Development Settings
  dev: {
    showReduxDevtools: getEnvBool('VITE_DEV_SHOW_REDUX_DEVTOOLS', true),
    showQueryDevtools: getEnvBool('VITE_DEV_SHOW_QUERY_DEVTOOLS', true),
  },
} as const

// Type export for use in other files
export type Config = typeof config
