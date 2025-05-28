import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

export const config = {
  jwtSecret: process.env.JWT_SECRET || throwError('JWT_SECRET is required'),
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
}

function throwError(message: string): never {
  throw new Error(message)
}
