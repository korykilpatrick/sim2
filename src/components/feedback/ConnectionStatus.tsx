import { useEffect, useState } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useWebSocket } from '@/hooks/useWebSocket'
import { config } from '@/config'

export function ConnectionStatus() {
  const { status, isAuthenticated, reconnectAttempts } = useWebSocket()
  const [showStatus, setShowStatus] = useState(false)
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null)

  // Show status when disconnected or reconnecting
  useEffect(() => {
    if (
      status === 'disconnected' ||
      status === 'reconnecting' ||
      status === 'error'
    ) {
      setShowStatus(true)
      if (hideTimeout) {
        clearTimeout(hideTimeout)
        setHideTimeout(null)
      }
    } else if (status === 'connected') {
      // Show connected status briefly after reconnecting
      if (showStatus) {
        const timeout = setTimeout(() => {
          setShowStatus(false)
        }, 3000)
        setHideTimeout(timeout)
      }
    }

    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout)
      }
    }
  }, [status, showStatus, hideTimeout])

  // Only show if WebSocket is enabled
  if (!config.features.websocket) {
    return null
  }

  if (!showStatus) {
    return null
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'connecting':
        return {
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          text: 'Connecting...',
          bgColor: 'bg-yellow-500',
          textColor: 'text-yellow-900',
        }
      case 'connected':
        return {
          icon: <Wifi className="h-4 w-4" />,
          text: isAuthenticated ? 'Connected' : 'Connected (Not authenticated)',
          bgColor: 'bg-green-500',
          textColor: 'text-green-900',
        }
      case 'disconnected':
        return {
          icon: <WifiOff className="h-4 w-4" />,
          text: 'Disconnected',
          bgColor: 'bg-gray-500',
          textColor: 'text-gray-900',
        }
      case 'reconnecting':
        return {
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          text: `Reconnecting... (${reconnectAttempts})`,
          bgColor: 'bg-orange-500',
          textColor: 'text-orange-900',
        }
      case 'error':
        return {
          icon: <WifiOff className="h-4 w-4" />,
          text: 'Connection error',
          bgColor: 'bg-red-500',
          textColor: 'text-red-900',
        }
      default:
        return {
          icon: <WifiOff className="h-4 w-4" />,
          text: 'Unknown',
          bgColor: 'bg-gray-500',
          textColor: 'text-gray-900',
        }
    }
  }

  const { icon, text, bgColor } = getStatusConfig()

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 transition-all duration-300',
        showStatus ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg',
          bgColor,
          'text-white',
        )}
      >
        {icon}
        <span className="text-sm font-medium">{text}</span>
      </div>
    </div>
  )
}

// Mini connection indicator for header
export function ConnectionIndicator() {
  const { status, isAuthenticated } = useWebSocket()

  // Only show if WebSocket is enabled
  if (!config.features.websocket) {
    return null
  }

  // Don't show when everything is normal
  if (status === 'connected' && isAuthenticated) {
    return null
  }

  const getIndicatorColor = () => {
    switch (status) {
      case 'connected':
        return isAuthenticated ? 'bg-green-500' : 'bg-yellow-500'
      case 'connecting':
      case 'reconnecting':
        return 'bg-yellow-500 animate-pulse'
      case 'disconnected':
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getTooltipText = () => {
    switch (status) {
      case 'connected':
        return isAuthenticated
          ? 'Real-time updates active'
          : 'Connected but not authenticated'
      case 'connecting':
        return 'Connecting to real-time updates...'
      case 'reconnecting':
        return 'Reconnecting to real-time updates...'
      case 'disconnected':
        return 'Real-time updates disconnected'
      case 'error':
        return 'Real-time connection error'
      default:
        return 'Unknown connection status'
    }
  }

  return (
    <div className="relative group">
      <div className={cn('h-2 w-2 rounded-full', getIndicatorColor())} />
      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {getTooltipText()}
      </div>
    </div>
  )
}
