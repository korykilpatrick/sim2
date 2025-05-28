/**
 * Runtime API validation utilities
 *
 * These utilities provide runtime validation for API responses to catch
 * contract mismatches and provide better error messages.
 *
 * @module utils/api-validation
 * @example
 * ```typescript
 * // Validate a vessel API response
 * const response = await vesselsApi.getById('vessel-123')
 * const vessel = validators.vessels.getById(response.data)
 *
 * // Manual validation with custom schema
 * const customSchema = z.object({ id: z.string(), name: z.string() })
 * const validated = validateApiResponse(response, customSchema, 'custom/endpoint')
 * ```
 */

import { z } from 'zod'

/**
 * Creates a schema for standard API responses
 * @template T - The data schema type
 * @param {z.ZodType<T>} dataSchema - Zod schema for the response data
 * @returns {z.ZodObject} Schema for the complete API response
 * @example
 * ```typescript
 * const UserResponseSchema = ApiResponseSchema(UserSchema)
 * ```
 */
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    timestamp: z.string().datetime(),
    error: z.optional(
      z.object({
        message: z.string(),
        code: z.string(),
        details: z.unknown().optional(),
      }),
    ),
  })

/**
 * Creates a schema for paginated API responses
 * @template T - The item schema type
 * @param {z.ZodType<T>} itemSchema - Zod schema for individual items
 * @returns {z.ZodObject} Schema for paginated response with metadata
 * @example
 * ```typescript
 * const VesselListSchema = PaginatedResponseSchema(VesselSchema)
 * ```
 */
export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    success: z.boolean(),
    data: z.array(itemSchema),
    timestamp: z.string().datetime(),
    meta: z.object({
      page: z.number().min(1),
      limit: z.number().min(1),
      total: z.number().min(0),
      totalPages: z.number().min(0),
    }),
    error: z.optional(
      z.object({
        message: z.string(),
        code: z.string(),
        details: z.unknown().optional(),
      }),
    ),
  })

// Auth schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  company: z.string(),
  department: z.string(),
  phone: z.string(),
  avatar: z.string().nullable(),
  role: z.enum(['user', 'admin', 'superadmin']),
  credits: z.number().min(0),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      push: z.boolean(),
    }),
    defaultView: z.enum([
      'dashboard',
      'vessels',
      'areas',
      'reports',
      'fleet',
      'investigations',
    ]),
  }),
  subscription: z.object({
    plan: z.enum(['basic', 'professional', 'enterprise']),
    credits: z.number(),
    creditsUsed: z.number(),
    renewalDate: z.string().datetime(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastLogin: z.string().datetime().nullable(),
  isActive: z.boolean(),
})

export const AuthResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string().optional(), // Now sent as httpOnly cookie
  refreshToken: z.string().optional(), // Now sent as httpOnly cookie
})

// Vessel schemas
export const PositionSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  timestamp: z.string().datetime(),
  speed: z.number().min(0).nullable(),
  course: z.number().min(0).max(360).nullable(),
})

export const VesselSchema = z.object({
  id: z.string(),
  imo: z.string(),
  mmsi: z.string(),
  name: z.string(),
  flag: z.string(),
  type: z.string(),
  status: z.enum(['active', 'inactive', 'unknown']),
  lastPosition: PositionSchema.nullable(),
  dimensions: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      draft: z.number().optional(),
    })
    .optional(),
})

// Area schemas
export const CoordinateSchema = z.object({
  lat: z.number(),
  lng: z.number(),
})

export const AreaSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['custom', 'port', 'anchorage', 'terminal', 'zone']),
  coordinates: z.array(CoordinateSchema),
  monitoringConfig: z.object({
    vesselCriteria: z.array(
      z.object({
        type: z.string(),
        value: z.union([z.string(), z.array(z.string())]),
      }),
    ),
    alertTypes: z.array(z.string()),
    schedule: z
      .object({
        enabled: z.boolean(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        timezone: z.string().optional(),
      })
      .optional(),
  }),
  status: z.enum(['active', 'inactive']),
  creditsPerDay: z.number(),
  vesselsInArea: z.number(),
  alerts: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// Credit schemas
export const CreditBalanceSchema = z.object({
  current: z.number().min(0),
  available: z.number().min(0).optional(), // backwards compatibility
  lifetime: z.number().min(0),
  expiring: z
    .object({
      amount: z.number(),
      date: z.string().datetime(),
    })
    .nullable()
    .optional(),
  expiringCredits: z
    .array(
      z.object({
        amount: z.number(),
        expiryDate: z.string(),
      }),
    )
    .optional(),
})

export const CreditTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['purchase', 'deduction', 'refund', 'bonus']),
  amount: z.number(),
  balance: z.number(),
  description: z.string(),
  service: z.string().optional(),
  timestamp: z.string().datetime(),
})

// Report schemas
export const ReportSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['compliance', 'chronology', 'movement', 'port_call']),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  vesselId: z.string(),
  vesselName: z.string(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  creditsCost: z.number(),
  downloadUrl: z.string().nullable(),
  error: z.string().nullable(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
})

// Fleet schemas
export const FleetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  vesselCount: z.number().min(0),
  vessels: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// Investigation schemas
export const InvestigationSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['anomaly', 'compliance', 'incident', 'custom']),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  vesselIds: z.array(z.string()),
  areaIds: z.array(z.string()).optional(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  creditsCost: z.number(),
  findings: z.string().nullable(),
  recommendations: z.string().nullable(),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        url: z.string(),
        type: z.string(),
        size: z.number(),
      }),
    )
    .optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
})

/**
 * Custom error class for API validation failures
 * @extends Error
 * @example
 * ```typescript
 * try {
 *   validateApiResponse(data, schema, 'users/list')
 * } catch (error) {
 *   if (error instanceof ApiValidationError) {
 *     console.error('Validation failed:', error.validationErrors)
 *   }
 * }
 * ```
 */
export class ApiValidationError extends Error {
  constructor(
    message: string,
    public endpoint: string,
    public validationErrors: z.ZodIssue[],
  ) {
    super(message)
    this.name = 'ApiValidationError'
  }
}

/**
 * Validates an API response against a schema
 * @template T - The expected response type
 * @param {unknown} response - The API response to validate
 * @param {z.ZodType<T>} schema - The Zod schema to validate against
 * @param {string} endpoint - The endpoint name for error reporting
 * @returns {T} The validated data
 * @throws {ApiValidationError} If validation fails
 * @example
 * ```typescript
 * const response = await fetch('/api/v1/users/123')
 * const data = await response.json()
 * const user = validateApiResponse(data, UserSchema, 'users/getById')
 * ```
 */
export function validateApiResponse<T>(
  response: unknown,
  schema: z.ZodType<T>,
  endpoint: string,
): T {
  const result = schema.safeParse(response)

  if (!result.success) {
    // Log validation errors in development
    if (import.meta.env.DEV) {
      console.error(`API validation failed for ${endpoint}:`, {
        response,
        errors: result.error.issues,
      })
    }

    throw new ApiValidationError(
      `Invalid API response from ${endpoint}`,
      endpoint,
      result.error.issues,
    )
  }

  return result.data
}

/**
 * Creates a validated API response handler
 * @template T - The expected response type
 * @param {z.ZodType<T>} schema - The Zod schema for the expected response
 * @param {string} endpoint - The endpoint name for error reporting
 * @returns {(response: unknown) => T} A function that validates and returns the response data
 * @example
 * ```typescript
 * const validateUserResponse = createValidatedHandler(UserSchema, 'users/getById')
 * const user = validateUserResponse(apiResponse)
 * ```
 */
export function createValidatedHandler<T>(
  schema: z.ZodType<T>,
  endpoint: string,
) {
  return (response: unknown): T => {
    return validateApiResponse(response, schema, endpoint)
  }
}

/**
 * Pre-configured validators for all API endpoints
 * @example
 * ```typescript
 * // Validate auth response
 * const authData = validators.auth.login(response)
 *
 * // Validate vessel search results
 * const vessels = validators.vessels.search(response)
 *
 * // Validate credit balance
 * const balance = validators.credits.balance(response)
 * ```
 */
export const validators = {
  auth: {
    login: createValidatedHandler(
      ApiResponseSchema(AuthResponseSchema),
      'auth/login',
    ),
    register: createValidatedHandler(
      ApiResponseSchema(AuthResponseSchema),
      'auth/register',
    ),
    profile: createValidatedHandler(
      ApiResponseSchema(UserSchema),
      'auth/profile',
    ),
  },
  vessels: {
    search: createValidatedHandler(
      PaginatedResponseSchema(VesselSchema),
      'vessels/search',
    ),
    getById: createValidatedHandler(
      ApiResponseSchema(VesselSchema),
      'vessels/getById',
    ),
  },
  areas: {
    list: createValidatedHandler(
      PaginatedResponseSchema(AreaSchema),
      'areas/list',
    ),
    create: createValidatedHandler(
      ApiResponseSchema(AreaSchema),
      'areas/create',
    ),
    getById: createValidatedHandler(
      ApiResponseSchema(AreaSchema),
      'areas/getById',
    ),
  },
  credits: {
    balance: createValidatedHandler(
      ApiResponseSchema(CreditBalanceSchema),
      'credits/balance',
    ),
    transactions: createValidatedHandler(
      PaginatedResponseSchema(CreditTransactionSchema),
      'credits/transactions',
    ),
  },
  reports: {
    create: createValidatedHandler(
      ApiResponseSchema(ReportSchema),
      'reports/create',
    ),
    list: createValidatedHandler(
      PaginatedResponseSchema(ReportSchema),
      'reports/list',
    ),
    getById: createValidatedHandler(
      ApiResponseSchema(ReportSchema),
      'reports/getById',
    ),
  },
  fleet: {
    list: createValidatedHandler(
      PaginatedResponseSchema(FleetSchema),
      'fleet/list',
    ),
    create: createValidatedHandler(
      ApiResponseSchema(FleetSchema),
      'fleet/create',
    ),
    getById: createValidatedHandler(
      ApiResponseSchema(FleetSchema),
      'fleet/getById',
    ),
  },
  investigations: {
    create: createValidatedHandler(
      ApiResponseSchema(InvestigationSchema),
      'investigations/create',
    ),
    list: createValidatedHandler(
      PaginatedResponseSchema(InvestigationSchema),
      'investigations/list',
    ),
    getById: createValidatedHandler(
      ApiResponseSchema(InvestigationSchema),
      'investigations/getById',
    ),
  },
}
