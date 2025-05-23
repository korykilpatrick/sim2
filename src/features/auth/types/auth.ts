export interface User {
  id: string
  email: string
  name: string
  company?: string
  role: 'user' | 'admin'
  credits: number
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  name: string
  company?: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}
