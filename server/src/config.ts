import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Only load .env file if not in test environment
if (process.env.NODE_ENV !== 'test') {
  // Load environment variables from the root .env file
  dotenv.config({ path: path.resolve(__dirname, '../../.env') })
}

// Validate JWT_SECRET
function validateJwtSecret(secret: string | undefined): string {
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }

  const defaultSecrets = [
    'your-super-secret-jwt-key-change-this-in-production',
    'change-this-secret',
    'secret',
    'default-secret',
  ]

  if (defaultSecrets.includes(secret)) {
    throw new Error('JWT_SECRET must be changed from default value')
  }

  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }

  // Warn in development if using a weak secret
  if (process.env.NODE_ENV !== 'production' && secret.includes('development')) {
    console.warn('[SECURITY WARNING] Using development JWT_SECRET. Never use this in production!')
  }

  return secret
}

// Export individual config values for better tree-shaking and type safety
export const JWT_SECRET = validateJwtSecret(process.env.JWT_SECRET)
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const PORT = parseInt(process.env.PORT || '3001', 10)

// Legacy config object for backward compatibility
export const config = {
  jwtSecret: JWT_SECRET,
  nodeEnv: NODE_ENV,
  port: PORT,
}

