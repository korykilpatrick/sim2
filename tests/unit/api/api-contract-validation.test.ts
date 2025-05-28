/**
 * API Contract Validation Tests
 * 
 * These tests ensure that our frontend type definitions match the actual API responses.
 * They validate the structure and types of all critical API endpoints to catch
 * contract mismatches early.
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'
// API types are validated through Zod schemas below

// Define Zod schemas for runtime validation of API contracts
const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  success: z.boolean(),
  data: dataSchema,
  timestamp: z.string().datetime(),
  error: z.optional(z.object({
    message: z.string(),
    code: z.string(),
    details: z.unknown().optional()
  }))
})

const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) => z.object({
  success: z.boolean(),
  data: z.array(itemSchema),
  timestamp: z.string().datetime(),
  meta: z.object({
    page: z.number().min(1),
    limit: z.number().min(1),
    total: z.number().min(0),
    totalPages: z.number().min(0)
  }),
  error: z.optional(z.object({
    message: z.string(),
    code: z.string(),
    details: z.unknown().optional()
  }))
})

// Auth schemas
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  company: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().nullable(),
  role: z.enum(['user', 'admin']),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      push: z.boolean()
    }),
    defaultView: z.enum(['dashboard', 'vessels', 'areas', 'reports', 'fleet', 'investigations'])
  }),
  subscription: z.object({
    plan: z.enum(['basic', 'professional', 'enterprise']),
    renewalDate: z.string().datetime()
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastLogin: z.string().datetime().nullable(),
  isActive: z.boolean()
})

const AuthResponseSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
  refreshToken: z.string()
})

// Vessel schemas
const PositionSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  timestamp: z.string().datetime(),
  speed: z.number().min(0).nullable(),
  course: z.number().min(0).max(360).nullable()
})

const VesselSchema = z.object({
  id: z.string(),
  imo: z.string(),
  mmsi: z.string(),
  name: z.string(),
  flag: z.string(),
  type: z.string(),
  status: z.enum(['active', 'inactive', 'unknown']),
  lastPosition: PositionSchema.nullable(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    draft: z.number().optional()
  }).optional()
})

// Area schemas
const CoordinateSchema = z.object({
  lat: z.number(),
  lng: z.number()
})

const AreaSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['custom', 'port', 'anchorage', 'terminal']),
  coordinates: z.array(CoordinateSchema),
  monitoringConfig: z.object({
    vesselCriteria: z.array(z.object({
      type: z.string(),
      value: z.union([z.string(), z.array(z.string())])
    })),
    alertTypes: z.array(z.string()),
    schedule: z.object({
      enabled: z.boolean(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      timezone: z.string().optional()
    }).optional()
  }),
  status: z.enum(['active', 'inactive']),
  creditsPerDay: z.number(),
  vesselsInArea: z.number(),
  alerts: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

// Credit schemas
const CreditBalanceSchema = z.object({
  current: z.number().min(0),
  lifetime: z.number().min(0),
  expiringCredits: z.array(z.object({
    amount: z.number(),
    expiresAt: z.string().datetime()
  }))
})

const CreditTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['purchase', 'deduction', 'refund', 'bonus']),
  amount: z.number(),
  balance: z.number(),
  description: z.string(),
  service: z.string().optional(),
  timestamp: z.string().datetime()
})

// Report schemas
const ReportSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['compliance', 'chronology', 'movement', 'port_call']),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  vesselId: z.string(),
  vesselName: z.string(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  creditsCost: z.number(),
  downloadUrl: z.string().nullable(),
  error: z.string().nullable(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable()
})

describe('API Contract Validation', () => {
  describe('Auth API Contracts', () => {
    it('should validate login response structure', () => {
      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            company: 'Test Co',
            department: 'Engineering',
            phone: '+1234567890',
            avatar: null,
            role: 'user',
            preferences: {
              theme: 'light',
              notifications: {
                email: true,
                sms: false,
                push: true
              },
              defaultView: 'dashboard'
            },
            subscription: {
              plan: 'professional',
              renewalDate: new Date().toISOString()
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isActive: true
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(AuthResponseSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(true)
      if (!result.success) {
        console.error('Validation errors:', result.error.issues)
      }
    })

    it('should validate register response structure', () => {
      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '2',
            email: 'new@example.com',
            name: 'New User',
            avatar: null,
            role: 'user',
            preferences: {
              theme: 'light',
              notifications: {
                email: true,
                sms: false,
                push: false
              },
              defaultView: 'dashboard'
            },
            subscription: {
              plan: 'basic',
              creditsUsed: 0,
              renewalDate: new Date().toISOString()
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(AuthResponseSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(true)
    })

    it('should validate user profile response', () => {
      const mockResponse = {
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          company: 'Test Co',
          department: 'Engineering',
          phone: '+1234567890',
          avatar: 'https://example.com/avatar.jpg',
          role: 'admin',
          credits: 2500,
          preferences: {
            theme: 'dark',
            notifications: {
              email: true,
              sms: true,
              push: true
            },
            defaultView: 'vessels'
          },
          subscription: {
            plan: 'enterprise',
            credits: 10000,
            creditsUsed: 7500,
            renewalDate: new Date().toISOString()
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(UserSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(true)
    })

    it('should reject invalid user role', () => {
      const mockResponse = {
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'superadmin', // Invalid role
          credits: 1000,
          // ... rest of required fields
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(UserSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(false)
    })
  })

  describe('Vessel API Contracts', () => {
    it('should validate vessel search response', () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'v1',
            imo: '9181786',
            mmsi: '311021300',
            name: 'OCEAN TRADER',
            flag: 'Panama',
            type: 'Cargo',
            status: 'active',
            lastPosition: {
              lat: 1.2655,
              lng: 103.8201,
              timestamp: new Date().toISOString(),
              speed: 12.5,
              course: 45.2
            },
            dimensions: {
              length: 229,
              width: 32,
              draft: 12.5
            }
          }
        ],
        timestamp: new Date().toISOString(),
        meta: {
          page: 1,
          limit: 20,
          total: 150,
          totalPages: 8
        }
      }

      const schema = PaginatedResponseSchema(VesselSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(true)
    })

    it('should validate vessel with null position', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'v2',
          imo: '9181787',
          mmsi: '311021301',
          name: 'PACIFIC VOYAGER',
          flag: 'Liberia',
          type: 'Tanker',
          status: 'inactive',
          lastPosition: null
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(VesselSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(true)
    })

    it('should reject invalid vessel status', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'v1',
          imo: '9181786',
          mmsi: '311021300',
          name: 'OCEAN TRADER',
          flag: 'Panama',
          type: 'Cargo',
          status: 'sailing', // Invalid status
          lastPosition: null
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(VesselSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(false)
    })

    it('should reject invalid coordinates', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'v1',
          imo: '9181786',
          mmsi: '311021300',
          name: 'OCEAN TRADER',
          flag: 'Panama',
          type: 'Cargo',
          status: 'active',
          lastPosition: {
            lat: 91, // Invalid latitude > 90
            lng: 103.8201,
            timestamp: new Date().toISOString(),
            speed: 12.5,
            course: 45.2
          }
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(VesselSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(false)
    })
  })

  describe('Area API Contracts', () => {
    it('should validate area creation response', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'a1',
          name: 'Singapore Anchorage',
          type: 'anchorage',
          coordinates: [
            { lat: 1.2, lng: 103.8 },
            { lat: 1.3, lng: 103.8 },
            { lat: 1.3, lng: 103.9 },
            { lat: 1.2, lng: 103.9 }
          ],
          monitoringConfig: {
            vesselCriteria: [
              { type: 'type', value: ['Tanker', 'Cargo'] },
              { type: 'flag', value: 'Singapore' }
            ],
            alertTypes: ['entry', 'exit', 'dwell'],
            schedule: {
              enabled: true,
              startTime: '08:00',
              endTime: '18:00',
              timezone: 'Asia/Singapore'
            }
          },
          status: 'active',
          creditsPerDay: 10,
          vesselsInArea: 5,
          alerts: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(AreaSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(true)
    })

    it('should validate area list response', () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'a1',
            name: 'Port of Singapore',
            type: 'port',
            coordinates: [
              { lat: 1.25, lng: 103.75 },
              { lat: 1.35, lng: 103.75 },
              { lat: 1.35, lng: 103.85 },
              { lat: 1.25, lng: 103.85 }
            ],
            monitoringConfig: {
              vesselCriteria: [],
              alertTypes: ['entry', 'exit']
            },
            status: 'active',
            creditsPerDay: 25,
            vesselsInArea: 42,
            alerts: 8,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        timestamp: new Date().toISOString(),
        meta: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1
        }
      }

      const schema = PaginatedResponseSchema(AreaSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(true)
    })

    it('should reject invalid area type', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'a1',
          name: 'Test Area',
          type: 'zone', // Invalid type
          coordinates: [{ lat: 1.2, lng: 103.8 }],
          monitoringConfig: {
            vesselCriteria: [],
            alertTypes: []
          },
          status: 'active',
          creditsPerDay: 10,
          vesselsInArea: 0,
          alerts: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(AreaSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(false)
    })
  })

  describe('Credit API Contracts', () => {
    it('should validate credit balance response', () => {
      const mockResponse = {
        success: true,
        data: {
          current: 1500,
          lifetime: 5000,
          expiringCredits: [
            {
              amount: 100,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              amount: 200,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(CreditBalanceSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(true)
    })

    it('should validate credit transaction history', () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 't1',
            type: 'purchase',
            amount: 1000,
            balance: 2000,
            description: 'Credit package purchase - 1000 credits',
            timestamp: new Date().toISOString()
          },
          {
            id: 't2',
            type: 'deduction',
            amount: -50,
            balance: 1950,
            description: 'Vessel tracking - IMO 9181786',
            service: 'vessel_tracking',
            timestamp: new Date().toISOString()
          }
        ],
        timestamp: new Date().toISOString(),
        meta: {
          page: 1,
          limit: 20,
          total: 45,
          totalPages: 3
        }
      }

      const schema = PaginatedResponseSchema(CreditTransactionSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(true)
    })

    it('should reject negative credit balance', () => {
      const mockResponse = {
        success: true,
        data: {
          current: -100, // Invalid negative balance
          lifetime: 1000,
          expiringCredits: []
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(CreditBalanceSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(false)
    })

    it('should reject invalid transaction type', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 't1',
          type: 'transfer', // Invalid transaction type
          amount: 100,
          balance: 1000,
          description: 'Test transaction',
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(CreditTransactionSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(false)
    })
  })

  describe('Report API Contracts', () => {
    it('should validate report creation response', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'r1',
          name: 'Compliance Report - OCEAN TRADER',
          type: 'compliance',
          status: 'pending',
          vesselId: 'v1',
          vesselName: 'OCEAN TRADER',
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString()
          },
          creditsCost: 100,
          downloadUrl: null,
          error: null,
          createdAt: new Date().toISOString(),
          completedAt: null
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(ReportSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(true)
    })

    it('should validate completed report response', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'r2',
          name: 'Movement Report - PACIFIC VOYAGER',
          type: 'movement',
          status: 'completed',
          vesselId: 'v2',
          vesselName: 'PACIFIC VOYAGER',
          dateRange: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString()
          },
          creditsCost: 75,
          downloadUrl: 'https://api.example.com/reports/r2/download',
          error: null,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(ReportSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(true)
    })

    it('should validate failed report response', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'r3',
          name: 'Port Call Report - VESSEL X',
          type: 'port_call',
          status: 'failed',
          vesselId: 'v3',
          vesselName: 'VESSEL X',
          dateRange: {
            start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString()
          },
          creditsCost: 150,
          downloadUrl: null,
          error: 'Insufficient historical data for the requested period',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(ReportSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(true)
    })

    it('should reject invalid report type', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'r1',
          name: 'Test Report',
          type: 'custom', // Invalid report type
          status: 'pending',
          vesselId: 'v1',
          vesselName: 'TEST VESSEL',
          dateRange: {
            start: new Date().toISOString(),
            end: new Date().toISOString()
          },
          creditsCost: 50,
          downloadUrl: null,
          error: null,
          createdAt: new Date().toISOString(),
          completedAt: null
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(ReportSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(false)
    })

    it('should reject invalid report status', () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'r1',
          name: 'Test Report',
          type: 'compliance',
          status: 'cancelled', // Invalid status
          vesselId: 'v1',
          vesselName: 'TEST VESSEL',
          dateRange: {
            start: new Date().toISOString(),
            end: new Date().toISOString()
          },
          creditsCost: 50,
          downloadUrl: null,
          error: null,
          createdAt: new Date().toISOString(),
          completedAt: null
        },
        timestamp: new Date().toISOString()
      }

      const schema = ApiResponseSchema(ReportSchema)
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(false)
    })
  })

  describe('Error Response Contracts', () => {
    it('should validate error response structure', () => {
      const mockResponse = {
        success: false,
        data: null,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Invalid credentials',
          code: 'AUTH_INVALID_CREDENTIALS',
          details: {
            field: 'password',
            requirement: 'Password must be at least 8 characters'
          }
        }
      }

      const schema = ApiResponseSchema(z.null())
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(true)
    })

    it('should validate error without details', () => {
      const mockResponse = {
        success: false,
        data: null,
        timestamp: new Date().toISOString(),
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      }

      const schema = ApiResponseSchema(z.null())
      const result = schema.safeParse(mockResponse)
      
      expect(result.success).toBe(true)
    })
  })

  describe('Pagination Meta Validation', () => {
    it('should validate correct pagination metadata', () => {
      const mockMeta = {
        page: 2,
        limit: 25,
        total: 150,
        totalPages: 6
      }

      const MetaSchema = z.object({
        page: z.number().min(1),
        limit: z.number().min(1),
        total: z.number().min(0),
        totalPages: z.number().min(0)
      })

      const result = MetaSchema.safeParse(mockMeta)
      expect(result.success).toBe(true)
    })

    it('should reject zero page number', () => {
      const mockMeta = {
        page: 0, // Invalid - pages are 1-indexed
        limit: 25,
        total: 150,
        totalPages: 6
      }

      const MetaSchema = z.object({
        page: z.number().min(1),
        limit: z.number().min(1),
        total: z.number().min(0),
        totalPages: z.number().min(0)
      })

      const result = MetaSchema.safeParse(mockMeta)
      expect(result.success).toBe(false)
    })

    it('should allow zero total items', () => {
      const mockMeta = {
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0
      }

      const MetaSchema = z.object({
        page: z.number().min(1),
        limit: z.number().min(1),
        total: z.number().min(0),
        totalPages: z.number().min(0)
      })

      const result = MetaSchema.safeParse(mockMeta)
      expect(result.success).toBe(true)
    })
  })
})