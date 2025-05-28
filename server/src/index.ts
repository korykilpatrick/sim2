import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
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
import analyticsRoutes from './routes/analytics'

// Import WebSocket setup
import { setupWebSocket } from './websocket'

// Import middleware
import { setCSRFToken, validateCSRFToken } from './middleware/csrf'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for dev
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow for dev tools
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'ws://localhost:3001', 'http://localhost:3001'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for development
  }),
)

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true, // Allow cookies to be sent
  }),
)
app.use(cookieParser())
app.use(express.json())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
})
app.use('/api/', limiter)

// CSRF token endpoint
app.get('/api/v1/csrf-token', setCSRFToken, (_req, res) => {
  res.json({ success: true, timestamp: new Date().toISOString() })
})

// Apply CSRF validation to all API routes
app.use('/api/', validateCSRFToken)

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
app.use('/api/v1/analytics', analyticsRoutes)

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
