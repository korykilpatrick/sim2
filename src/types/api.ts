export interface ApiResponse<T = any> {
  success: boolean
  data: T
  timestamp: string
  error?: {
    message: string
    code: string
    details?: any
  }
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code: string
  status: number
}
