import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'

// Extend Express Request type to include user
declare module 'express' {
  interface Request {
    user?: {
      userId: string
      role?: string
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // First check cookies, then fall back to Authorization header
  let token = req.cookies?.accessToken

  if (!token) {
    const authHeader = req.headers['authorization']
    token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Access token required',
        code: 'NO_TOKEN',
      },
    })
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string }
    req.user = { userId: decoded.userId }
    next()
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      },
    })
  }
}
