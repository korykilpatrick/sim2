/**
 * Tests for API validation utilities
 */

import { describe, it, expect, vi } from 'vitest'
import {
  validateApiResponse,
  createValidatedHandler,
  validators,
  ApiValidationError,
  ApiResponseSchema,
  UserSchema
} from '@/utils/api-validation'
import { z } from 'zod'

// Mock import.meta.env
vi.stubGlobal('import.meta.env', { DEV: true })

describe('API Validation Utilities', () => {
  describe('validateApiResponse', () => {
    it('should validate a correct response', () => {
      const schema = z.object({
        id: z.string(),
        name: z.string()
      })
      
      const response = {
        id: '123',
        name: 'Test'
      }
      
      const result = validateApiResponse(response, schema, 'test/endpoint')
      expect(result).toEqual(response)
    })
    
    it('should throw ApiValidationError for invalid response', () => {
      const schema = z.object({
        id: z.string(),
        name: z.string()
      })
      
      const response = {
        id: 123, // Should be string
        name: 'Test'
      }
      
      expect(() => {
        validateApiResponse(response, schema, 'test/endpoint')
      }).toThrow(ApiValidationError)
    })
    
    it('should include validation errors in the error object', () => {
      const schema = z.object({
        id: z.string(),
        name: z.string()
      })
      
      const response = {
        id: 123,
        name: 'Test'
      }
      
      try {
        validateApiResponse(response, schema, 'test/endpoint')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiValidationError)
        if (error instanceof ApiValidationError) {
          expect(error.endpoint).toBe('test/endpoint')
          expect(error.validationErrors).toHaveLength(1)
          expect(error.validationErrors[0].path).toEqual(['id'])
        }
      }
    })
    
    it('should log errors in development mode', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const schema = z.object({
        id: z.string()
      })
      
      const response = { id: 123 }
      
      try {
        validateApiResponse(response, schema, 'test/endpoint')
      } catch {
        // Expected to throw
      }
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'API validation failed for test/endpoint:',
        expect.objectContaining({
          response,
          errors: expect.any(Array)
        })
      )
      
      consoleSpy.mockRestore()
    })
  })
  
  describe('createValidatedHandler', () => {
    it('should create a function that validates responses', () => {
      const schema = z.object({
        success: z.boolean(),
        data: z.string()
      })
      
      const handler = createValidatedHandler(schema, 'test/endpoint')
      
      const validResponse = {
        success: true,
        data: 'test'
      }
      
      expect(handler(validResponse)).toEqual(validResponse)
    })
    
    it('should throw when handler receives invalid data', () => {
      const schema = z.object({
        success: z.boolean(),
        data: z.string()
      })
      
      const handler = createValidatedHandler(schema, 'test/endpoint')
      
      const invalidResponse = {
        success: 'true', // Should be boolean
        data: 'test'
      }
      
      expect(() => handler(invalidResponse)).toThrow(ApiValidationError)
    })
  })
  
  describe('Pre-configured validators', () => {
    describe('Auth validators', () => {
      it('should validate login response', () => {
        const mockResponse = {
          success: true,
          data: {
            user: {
              id: '1',
              email: 'test@example.com',
              name: 'Test User',
              avatar: null,
              role: 'user',
              credits: 1000,
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
                credits: 1000,
                creditsUsed: 0,
                renewalDate: new Date().toISOString()
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              isActive: true
            },
            accessToken: 'mock-token',
            refreshToken: 'mock-refresh'
          },
          timestamp: new Date().toISOString()
        }
        
        expect(() => validators.auth.login(mockResponse)).not.toThrow()
      })
      
      it('should reject login response with invalid user role', () => {
        const mockResponse = {
          success: true,
          data: {
            user: {
              id: '1',
              email: 'test@example.com',
              name: 'Test User',
              role: 'superuser', // Invalid role
              // ... rest of fields
            },
            accessToken: 'token',
            refreshToken: 'refresh'
          },
          timestamp: new Date().toISOString()
        }
        
        expect(() => validators.auth.login(mockResponse)).toThrow(ApiValidationError)
      })
    })
    
    describe('Vessel validators', () => {
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
              }
            }
          ],
          timestamp: new Date().toISOString(),
          meta: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1
          }
        }
        
        expect(() => validators.vessels.search(mockResponse)).not.toThrow()
      })
      
      it('should reject vessel with invalid coordinates', () => {
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
              lat: 95, // Invalid latitude
              lng: 103.8201,
              timestamp: new Date().toISOString(),
              speed: 12.5,
              course: 45.2
            }
          },
          timestamp: new Date().toISOString()
        }
        
        expect(() => validators.vessels.getById(mockResponse)).toThrow(ApiValidationError)
      })
    })
    
    describe('Credit validators', () => {
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
              }
            ]
          },
          timestamp: new Date().toISOString()
        }
        
        expect(() => validators.credits.balance(mockResponse)).not.toThrow()
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
        
        expect(() => validators.credits.balance(mockResponse)).toThrow(ApiValidationError)
      })
    })
    
    describe('Report validators', () => {
      it('should validate report creation response', () => {
        const mockResponse = {
          success: true,
          data: {
            id: 'r1',
            name: 'Compliance Report',
            type: 'compliance',
            status: 'pending',
            vesselId: 'v1',
            vesselName: 'OCEAN TRADER',
            dateRange: {
              start: new Date().toISOString(),
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
        
        expect(() => validators.reports.create(mockResponse)).not.toThrow()
      })
      
      it('should reject invalid report type', () => {
        const mockResponse = {
          success: true,
          data: {
            id: 'r1',
            name: 'Custom Report',
            type: 'custom', // Invalid type
            status: 'pending',
            vesselId: 'v1',
            vesselName: 'OCEAN TRADER',
            dateRange: {
              start: new Date().toISOString(),
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
        
        expect(() => validators.reports.create(mockResponse)).toThrow(ApiValidationError)
      })
    })
  })
  
  describe('ApiValidationError', () => {
    it('should create error with correct properties', () => {
      const validationErrors = [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['id'],
          message: 'Expected string, received number'
        }
      ]
      
      const error = new ApiValidationError(
        'Validation failed',
        'test/endpoint',
        validationErrors
      )
      
      expect(error.name).toBe('ApiValidationError')
      expect(error.message).toBe('Validation failed')
      expect(error.endpoint).toBe('test/endpoint')
      expect(error.validationErrors).toEqual(validationErrors)
    })
  })
})