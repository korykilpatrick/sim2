import { createContext, useContext } from 'react'

interface WebSocketContextValue {
  isConnected: boolean
}

export const WebSocketContext = createContext<WebSocketContextValue>({
  isConnected: false,
})

export const useWebSocketContext = () => useContext(WebSocketContext)