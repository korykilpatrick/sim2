import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { createLogger } from '../utils/logger'
import type { VesselPosition, AreaAlert } from '../types/websocket'

const logger = createLogger('WebSocket')

interface AuthenticatedSocket extends Socket {
  userId?: string
  authenticated?: boolean
}

interface TokenPayload {
  id: string
  email: string
  exp: number
}

// Mock JWT secret - in production, use environment variable
const JWT_SECRET = 'your-secret-key'

// Store for real-time data
const vesselPositions = new Map<string, VesselPosition>()
const areaAlerts = new Map<string, AreaAlert[]>()
const activeTrackings = new Map<string, Set<string>>() // vesselId -> Set of socketIds
const activeMonitorings = new Map<string, Set<string>>() // areaId -> Set of socketIds

export function setupWebSocket(io: Server) {
  // Middleware for authentication
  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token

    if (!token) {
      // Allow connection but mark as unauthenticated
      socket.authenticated = false
      return next()
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
      socket.userId = decoded.id
      socket.authenticated = true
      next()
    } catch (err) {
      socket.authenticated = false
      next()
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Client connected: ${socket.id}`)

    // Handle authentication
    socket.on('authenticate', (token: string) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
        socket.userId = decoded.id
        socket.authenticated = true
        socket.emit('authenticated', { userId: decoded.id, success: true })
        logger.info(`Client authenticated: ${socket.id}, userId: ${decoded.id}`)
      } catch (err) {
        socket.emit('unauthorized', { message: 'Invalid token' })
      }
    })

    // Vessel tracking room management
    socket.on('join_vessel_room', (vesselId: string) => {
      if (!socket.authenticated) {
        socket.emit('unauthorized', { message: 'Authentication required' })
        return
      }

      const room = `vessel:${vesselId}`
      socket.join(room)

      // Track active tracking
      if (!activeTrackings.has(vesselId)) {
        activeTrackings.set(vesselId, new Set())
      }
      activeTrackings.get(vesselId)!.add(socket.id)

      logger.debug(`Socket ${socket.id} joined vessel room: ${vesselId}`)

      // Send current position if available
      if (vesselPositions.has(vesselId)) {
        socket.emit('vessel_position_update', vesselPositions.get(vesselId))
      }

      // Start simulating vessel updates for demo
      startVesselSimulation(io, vesselId)
    })

    socket.on('leave_vessel_room', (vesselId: string) => {
      const room = `vessel:${vesselId}`
      socket.leave(room)

      // Remove from active tracking
      const trackers = activeTrackings.get(vesselId)
      if (trackers) {
        trackers.delete(socket.id)
        if (trackers.size === 0) {
          activeTrackings.delete(vesselId)
          stopVesselSimulation(vesselId)
        }
      }

      logger.debug(`Socket ${socket.id} left vessel room: ${vesselId}`)
    })

    // Area monitoring room management
    socket.on('join_area_room', (areaId: string) => {
      if (!socket.authenticated) {
        socket.emit('unauthorized', { message: 'Authentication required' })
        return
      }

      const room = `area:${areaId}`
      socket.join(room)

      // Track active monitoring
      if (!activeMonitorings.has(areaId)) {
        activeMonitorings.set(areaId, new Set())
      }
      activeMonitorings.get(areaId)!.add(socket.id)

      logger.debug(`Socket ${socket.id} joined area room: ${areaId}`)

      // Send recent alerts if available
      if (areaAlerts.has(areaId)) {
        const alerts = areaAlerts.get(areaId)!
        alerts.slice(-5).forEach((alert) => {
          socket.emit('area_alert', alert)
        })
      }

      // Start simulating area alerts for demo
      startAreaSimulation(io, areaId)
    })

    socket.on('leave_area_room', (areaId: string) => {
      const room = `area:${areaId}`
      socket.leave(room)

      // Remove from active monitoring
      const monitors = activeMonitorings.get(areaId)
      if (monitors) {
        monitors.delete(socket.id)
        if (monitors.size === 0) {
          activeMonitorings.delete(areaId)
          stopAreaSimulation(areaId)
        }
      }

      logger.debug(`Socket ${socket.id} left area room: ${areaId}`)
    })

    // Alert management
    socket.on('mark_alert_read', (_alertId: string) => {
      if (!socket.authenticated) {
        socket.emit('unauthorized', { message: 'Authentication required' })
        return
      }

      logger.debug(`Alert marked as read: ${_alertId} by user ${socket.userId}`)
      // In production, update database
    })

    socket.on('dismiss_alert', (alertId: string) => {
      if (!socket.authenticated) {
        socket.emit('unauthorized', { message: 'Authentication required' })
        return
      }

      logger.debug(`Alert dismissed: ${alertId} by user ${socket.userId}`)
      socket.emit('alert_dismissed', { alertId })
      // In production, update database
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`)

      // Clean up vessel trackings
      activeTrackings.forEach((trackers, vesselId) => {
        if (trackers.has(socket.id)) {
          trackers.delete(socket.id)
          if (trackers.size === 0) {
            activeTrackings.delete(vesselId)
            stopVesselSimulation(vesselId)
          }
        }
      })

      // Clean up area monitorings
      activeMonitorings.forEach((monitors, areaId) => {
        if (monitors.has(socket.id)) {
          monitors.delete(socket.id)
          if (monitors.size === 0) {
            activeMonitorings.delete(areaId)
            stopAreaSimulation(areaId)
          }
        }
      })
    })
  })
}

// Simulation functions for demo purposes
const vesselSimulations = new Map<string, NodeJS.Timeout>()
const areaSimulations = new Map<string, NodeJS.Timeout>()

function startVesselSimulation(io: Server, vesselId: string) {
  // Don't start multiple simulations for the same vessel
  if (vesselSimulations.has(vesselId)) return

  logger.debug(`Starting vessel simulation for: ${vesselId}`)

  // Initial position
  let lat = 30 + Math.random() * 20 - 10
  let lng = -40 + Math.random() * 40 - 20
  let heading = Math.random() * 360
  let speed = 10 + Math.random() * 10

  const interval = setInterval(() => {
    // Update position
    lat += (Math.random() - 0.5) * 0.1
    lng += (Math.random() - 0.5) * 0.1
    heading = (heading + (Math.random() - 0.5) * 10 + 360) % 360
    speed = Math.max(0, speed + (Math.random() - 0.5) * 2)

    const update = {
      vesselId,
      timestamp: new Date().toISOString(),
      position: { lat, lng },
      heading,
      speed,
      status: speed > 1 ? 'underway' : 'stopped',
    }

    vesselPositions.set(vesselId, update)
    io.to(`vessel:${vesselId}`).emit('vessel_position_update', update)

    // Occasionally emit status changes
    if (Math.random() < 0.1) {
      const statusChange = {
        vesselId,
        previousStatus: 'underway',
        newStatus: Math.random() < 0.5 ? 'stopped' : 'underway',
        timestamp: new Date().toISOString(),
        reason: 'Simulation status change',
      }
      io.to(`vessel:${vesselId}`).emit('vessel_status_change', statusChange)
    }
  }, 5000) // Update every 5 seconds

  vesselSimulations.set(vesselId, interval)
}

function stopVesselSimulation(vesselId: string) {
  const interval = vesselSimulations.get(vesselId)
  if (interval) {
    clearInterval(interval)
    vesselSimulations.delete(vesselId)
    logger.debug(`Stopped vessel simulation for: ${vesselId}`)
  }
}

function startAreaSimulation(io: Server, areaId: string) {
  // Don't start multiple simulations for the same area
  if (areaSimulations.has(areaId)) return

  logger.debug(`Starting area simulation for: ${areaId}`)

  const interval = setInterval(() => {
    // Random chance of generating an alert
    if (Math.random() < 0.3) {
      const alertTypes = [
        'vessel_entered',
        'vessel_exited',
        'threshold_exceeded',
        'unusual_activity',
      ] as const
      const severities = ['low', 'medium', 'high', 'critical'] as const

      const alert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        areaId,
        areaName: `Area ${areaId}`,
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        message: `Test alert for area ${areaId}`,
        timestamp: new Date().toISOString(),
        data: {
          vesselCount: Math.floor(Math.random() * 10) + 1,
        },
      }

      // Store alert
      if (!areaAlerts.has(areaId)) {
        areaAlerts.set(areaId, [])
      }
      areaAlerts.get(areaId)!.push(alert)

      // Emit to room
      io.to(`area:${areaId}`).emit('area_alert', alert)

      // Also emit a general alert
      const generalAlert = {
        id: alert.id,
        type: 'area' as const,
        title: `Alert in ${alert.areaName}`,
        message: alert.message,
        severity:
          alert.severity === 'critical'
            ? 'error'
            : alert.severity === 'high'
              ? 'warning'
              : 'info',
        timestamp: alert.timestamp,
        read: false,
        actionUrl: `/areas/${areaId}`,
        data: alert.data,
      }
      io.to(`area:${areaId}`).emit('alert_created', generalAlert)

      // Simulate vessel entry/exit
      if (alert.type === 'vessel_entered' || alert.type === 'vessel_exited') {
        const vesselEvent = {
          areaId,
          areaName: `Area ${areaId}`,
          vesselId: `vessel-${Math.random().toString(36).substr(2, 9)}`,
          vesselName: `Test Vessel ${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          position: {
            lat: 30 + Math.random() * 20 - 10,
            lng: -40 + Math.random() * 40 - 20,
          },
        }
        io.to(`area:${areaId}`).emit(
          alert.type === 'vessel_entered'
            ? 'area_vessel_entered'
            : 'area_vessel_exited',
          vesselEvent,
        )
      }
    }
  }, 10000) // Check every 10 seconds

  areaSimulations.set(areaId, interval)
}

function stopAreaSimulation(areaId: string) {
  const interval = areaSimulations.get(areaId)
  if (interval) {
    clearInterval(interval)
    areaSimulations.delete(areaId)
    logger.debug(`Stopped area simulation for: ${areaId}`)
  }
}

// Utility function to broadcast credit updates
export function broadcastCreditUpdate(
  io: Server,
  _userId: string,
  balance: number,
  change: number,
) {
  // In production, find sockets for this user
  io.emit('credit_balance_updated', { balance, change })

  if (balance < 100) {
    io.emit('credit_low_balance', { balance, threshold: 100 })
  }
}

// Utility function to broadcast system messages
export function broadcastSystemMessage(
  io: Server,
  message: string,
  type: 'info' | 'warning' | 'error' = 'info',
) {
  io.emit('server_message', { message, type })
}
