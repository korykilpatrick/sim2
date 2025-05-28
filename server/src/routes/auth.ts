import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { mockUsers } from '../data/mockData'
import { JWT_SECRET } from '../config'

const router = Router()

// JWT payload type
interface JWTPayload {
  userId: string
}

// Helper to generate tokens
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '1h',
  })
  const refreshToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '7d',
  })
  return { accessToken, refreshToken }
}

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const user = mockUsers.find((u) => u.email === email)

  if (!user || !(await bcrypt.compare(password, user.password))) {
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

  // Set httpOnly cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000, // 1 hour
  })
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      // Don't send tokens in response body anymore for security
    },
    timestamp: new Date().toISOString(),
  })
})

// Register
router.post('/register', async (req, res) => {
  const { email, password, name, company } = req.body

  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Check if user exists
  if (mockUsers.find((u) => u.email === email)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Email already registered',
        code: 'EMAIL_EXISTS',
      },
    })
  }

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create new user
  const newUser = {
    id: String(mockUsers.length + 1),
    email,
    password: hashedPassword,
    name,
    company: company || '',
    department: '',
    phone: '',
    avatar: null,
    role: 'user' as const,
    preferences: {
      theme: 'light' as const,
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      defaultView: 'dashboard' as const,
    },
    subscription: {
      plan: 'professional' as const,
      renewalDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
  }

  mockUsers.push(newUser)

  const { accessToken, refreshToken } = generateTokens(newUser.id)
  const { password: newUserPassword, ...userWithoutPassword } = newUser
  void newUserPassword // Intentionally unused

  // Set httpOnly cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000, // 1 hour
  })
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      // Don't send tokens in response body anymore for security
    },
    timestamp: new Date().toISOString(),
  })
})

// Refresh token
router.post('/refresh', async (req, res) => {
  // Read refresh token from cookie only
  const refreshToken = req.cookies?.refreshToken

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
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as JWTPayload
    const tokens = generateTokens(decoded.userId)

    // Set new httpOnly cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    })
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.json({
      success: true,
      data: {
        // Don't send tokens in response body anymore for security
      },
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
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    const user = mockUsers.find((u) => u.id === decoded.userId)

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

// Update profile
router.put('/profile', async (req, res) => {
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
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    const userIndex = mockUsers.findIndex((u) => u.id === decoded.userId)

    if (userIndex === -1) {
      throw new Error('User not found')
    }

    // Update user data
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    }

    const { password: pwd, ...userWithoutPassword } = mockUsers[userIndex]
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

// Change password
router.post('/change-password', async (req, res) => {
  const authHeader = req.headers.authorization
  const { currentPassword, newPassword } = req.body

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
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    const userIndex = mockUsers.findIndex((u) => u.id === decoded.userId)

    if (userIndex === -1) {
      throw new Error('User not found')
    }

    // Verify current password
    if (
      !(await bcrypt.compare(currentPassword, mockUsers[userIndex].password))
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Current password is incorrect',
          code: 'INCORRECT_PASSWORD',
        },
      })
    }

    // Update password with hashed version
    mockUsers[userIndex].password = await bcrypt.hash(newPassword, 10)
    mockUsers[userIndex].updatedAt = new Date().toISOString()

    res.json({
      success: true,
      data: { message: 'Password changed successfully' },
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
  // Clear httpOnly cookies
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')

  res.json({
    success: true,
    data: { message: 'Logged out successfully' },
    timestamp: new Date().toISOString(),
  })
})

export default router
