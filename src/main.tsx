import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { WebSocketProvider } from './providers/WebSocketProvider'
import { ToastProvider } from './providers/ToastProvider'
import { ErrorBoundary } from '@components/feedback'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary
      onError={(_error, _errorInfo) => {
        // In production, this would send to error tracking service
        if (import.meta.env.PROD) {
          // TODO: Integrate error monitoring service
          // Example: Sentry, LogRocket, or similar
          // captureException(error, { 
          //   extra: errorInfo,
          //   tags: { environment: 'production' }
          // })
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WebSocketProvider>
            <App />
            <ToastProvider />
          </WebSocketProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
