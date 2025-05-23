import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { mockUsers } from '../data/mockData'

const router = Router()
const JWT_SECRET = 'mock-jwt-secret'

// Helper to generate tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' })
  const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 500))

  const user = mockUsers.find(u => u.email === email && u.password === password)

  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      },
    })
  }

  const { accessToken, refreshToken } = generateTokens(user.id)
  const { password: userPassword, ...userWithoutPassword } = user
  void userPassword // Intentionally unused

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    },
    timestamp: new Date().toISOString(),
  })
})

// Register
router.post('/register', async (req, res) => {
  const { email, password, name, company } = req.body

  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Check if user exists
  if (mockUsers.find(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Email already registered',
        code: 'EMAIL_EXISTS',
      },
    })
  }

  // Create new user
  const newUser = {
    id: String(mockUsers.length + 1),
    email,
    password,
    name,
    company,
    role: 'user' as const,
    credits: 100, // Free credits on signup
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  mockUsers.push(newUser)

  const { accessToken, refreshToken } = generateTokens(newUser.id)
  const { password: newUserPassword, ...userWithoutPassword } = newUser
  void newUserPassword // Intentionally unused

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    },
    timestamp: new Date().toISOString(),
  })
})

// Refresh token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Refresh token required',
        code: 'TOKEN_REQUIRED',
      },
    })
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as any
    const tokens = generateTokens(decoded.userId)

    res.json({
      success: true,
      data: tokens,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid refresh token',
        code: 'INVALID_TOKEN',
      },
    })
  }
})

// Get current user
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authorization required',
        code: 'AUTH_REQUIRED',
      },
    })
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = mockUsers.find(u => u.id === decoded.userId)

    if (!user) {
      throw new Error('User not found')
    }

    const { password: pwd, ...userWithoutPassword } = user
    void pwd // Intentionally unused

    res.json({
      success: true,
      data: userWithoutPassword,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      },
    })
  }
})

// Logout
router.post('/logout', (_req, res) => {
  res.json({
    success: true,
    data: null,
    timestamp: new Date().toISOString(),
  })
})

export default router