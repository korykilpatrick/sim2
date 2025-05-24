/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_URL: string
  readonly VITE_WEBSOCKET_URL: string

  // Authentication
  readonly VITE_AUTH_TOKEN_KEY: string
  readonly VITE_REFRESH_TOKEN_KEY: string

  // Error Tracking
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_SENTRY_ENVIRONMENT?: string
  readonly VITE_SENTRY_TRACES_SAMPLE_RATE?: string

  // Analytics
  readonly VITE_ANALYTICS_ID?: string
  readonly VITE_ANALYTICS_ENABLED?: string

  // Feature Flags
  readonly VITE_ENABLE_MOCK_API?: string
  readonly VITE_ENABLE_DEBUG_MODE?: string
  readonly VITE_ENABLE_WEBSOCKET?: string

  // Map Configuration
  readonly VITE_MAPBOX_ACCESS_TOKEN?: string
  readonly VITE_DEFAULT_MAP_CENTER_LAT?: string
  readonly VITE_DEFAULT_MAP_CENTER_LNG?: string
  readonly VITE_DEFAULT_MAP_ZOOM?: string

  // External Services
  readonly VITE_STRIPE_PUBLIC_KEY?: string
  readonly VITE_INTERCOM_APP_ID?: string

  // Application Settings
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_SESSION_TIMEOUT_MINUTES?: string
  readonly VITE_API_TIMEOUT_MS?: string

  // Development Settings
  readonly VITE_DEV_SHOW_REDUX_DEVTOOLS?: string
  readonly VITE_DEV_SHOW_QUERY_DEVTOOLS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
