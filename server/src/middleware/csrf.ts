import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

/**
 * CSRF protection middleware using double-submit cookie pattern.
 * Generates and validates CSRF tokens for state-changing requests.
 * 
 * Security approach:
 * - All state-changing requests (POST, PUT, DELETE) require CSRF tokens
 * - This includes auth endpoints (login/register) to prevent CSRF attacks
 * - Clients must first GET /api/v1/csrf-token before making auth requests
 * - Token is stored in both cookie and must be sent in X-CSRF-Token header
 */

// Generate a random CSRF token
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

// Middleware to set CSRF token cookie
export const setCSRFToken = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = generateCSRFToken()

  // Set CSRF token as a regular cookie (not httpOnly) so JS can read it
  res.cookie('csrf-token', token, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000, // 1 hour
  })

  // Also send in response header for initial requests
  res.setHeader('X-CSRF-Token', token)

  next()
}

// Middleware to validate CSRF token on state-changing requests
export const validateCSRFToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  // Get token from header or body
  const headerToken = req.headers['x-csrf-token'] as string
  const cookieToken = req.cookies['csrf-token']

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid or missing CSRF token',
        code: 'CSRF_VALIDATION_FAILED',
      },
    })
  }

  next()
}
