import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import rateLimit from 'express-rate-limit'

// Import routes
import authRoutes from './routes/auth'
import vesselsRoutes from './routes/vessels'
import trackingRoutes from './routes/tracking'
import productsRoutes from './routes/products'
import areasRoutes from './routes/areas'
import reportsRoutes from './routes/reports'
import investigationsRoutes from './routes/investigations'
import creditsRoutes from './routes/credits'
import fleetsRoutes from './routes/fleets'

// Import WebSocket setup
import { setupWebSocket } from './websocket'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(cors())
app.use(express.json())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/vessels', vesselsRoutes)
app.use('/api/v1/tracking', trackingRoutes)
app.use('/api/v1/products', productsRoutes)
app.use('/api/v1/areas', areasRoutes)
app.use('/api/v1/reports', reportsRoutes)
app.use('/api/v1/investigations', investigationsRoutes)
app.use('/api/v1/credits', creditsRoutes)
app.use('/api/v1/fleets', fleetsRoutes)

// Setup WebSocket handlers
setupWebSocket(io)

// Error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err.stack)
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    })
  },
)

// Start server
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  // Server started
})
