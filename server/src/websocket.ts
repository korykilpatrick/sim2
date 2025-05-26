import { Server, Socket } from 'socket.io'
import { mockVessels } from './data/mockData'

export function setupWebSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    // TODO: Replace with proper logging
    // console.log('Client connected:', socket.id)

    // Send initial vessel positions
    socket.emit('vessels:initial', mockVessels)

    // Simulate vessel position updates every 5 seconds
    const updateInterval = setInterval(() => {
      // Randomly update some vessel positions
      const updates = mockVessels
        .filter(() => Math.random() > 0.7) // Update ~30% of vessels
        .map((vessel) => ({
          id: vessel.id,
          imo: vessel.imo,
          lastPosition: {
            ...vessel.lastPosition,
            lat: vessel.lastPosition.lat + (Math.random() - 0.5) * 0.01,
            lng: vessel.lastPosition.lng + (Math.random() - 0.5) * 0.01,
            timestamp: new Date().toISOString(),
            speed: Math.max(
              0,
              vessel.lastPosition.speed + (Math.random() - 0.5) * 2,
            ),
            course:
              (vessel.lastPosition.course + (Math.random() - 0.5) * 10 + 360) %
              360,
          },
        }))

      if (updates.length > 0) {
        socket.emit('vessels:update', updates)
      }
    }, 5000)

    // Handle client requests
    socket.on('vessels:subscribe', (_vesselIds: string[]) => {
      // TODO: Replace with proper logging
      // console.log('Client subscribed to vessels:', vesselIds)
      // In a real app, we'd track subscriptions and only send relevant updates
    })

    socket.on('vessels:unsubscribe', (_vesselIds: string[]) => {
      // TODO: Replace with proper logging
      // console.log('Client unsubscribed from vessels:', vesselIds)
    })

    // Clean up on disconnect
    socket.on('disconnect', () => {
      // TODO: Replace with proper logging
      // console.log('Client disconnected:', socket.id)
      clearInterval(updateInterval)
    })
  })
}
