/**
 * Tests for API endpoint validation integration
 *
 * These tests demonstrate how to integrate runtime validation
 * into actual API endpoints to catch contract mismatches.
 */

import { describe, it, expect } from 'vitest'
import { validators, ApiValidationError } from '@/utils/api-validation'
import type { ApiResponse } from '@/api/types'

describe('API Endpoint Validation Integration', () => {
  describe('Auth Response Validation', () => {
    it('should validate successful login response', () => {
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
                push: true,
              },
              defaultView: 'dashboard',
            },
            subscription: {
              plan: 'professional',
              renewalDate: new Date().toISOString(),
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isActive: true,
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
        timestamp: new Date().toISOString(),
      }

      // Simulate API response
      const apiResponse: ApiResponse<unknown> = mockResponse

      // Validate the response
      const validatedData = validators.auth.login(apiResponse)
      expect(validatedData.data.user.email).toBe('test@example.com')
      expect(validatedData.data.accessToken).toBe('mock-access-token')
    })

    it('should catch invalid auth response structure', () => {
      const invalidResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'superadmin', // Invalid role
            // Missing required fields
          },
          accessToken: 'token',
          refreshToken: 'refresh',
        },
        timestamp: new Date().toISOString(),
      }

      // Simulate API response
      const apiResponse: ApiResponse<unknown> = invalidResponse

      // Validation should throw
      expect(() => validators.auth.login(apiResponse)).toThrow(
        ApiValidationError,
      )
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
          preferences: {
            theme: 'dark',
            notifications: {
              email: true,
              sms: true,
              push: true,
            },
            defaultView: 'vessels',
          },
          subscription: {
            plan: 'enterprise',
            renewalDate: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
        },
        timestamp: new Date().toISOString(),
      }

      // Simulate API response
      const apiResponse: ApiResponse<unknown> = mockResponse

      const validatedData = validators.auth.profile(apiResponse)
      expect(validatedData.data.role).toBe('admin')
      expect(validatedData.data.subscription.plan).toBe('enterprise')
    })
  })

  describe('Vessel Response Validation', () => {
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
              course: 45.2,
            },
            dimensions: {
              length: 229,
              width: 32,
              draft: 12.5,
            },
          },
        ],
        timestamp: new Date().toISOString(),
        meta: {
          page: 1,
          limit: 20,
          total: 150,
          totalPages: 8,
        },
      }

      // Simulate API response
      const apiResponse: ApiResponse<unknown> = mockResponse

      const validatedData = validators.vessels.search(apiResponse)
      expect(validatedData.data[0].name).toBe('OCEAN TRADER')
      expect(validatedData.meta.total).toBe(150)
    })

    it('should catch invalid vessel coordinates', () => {
      const invalidResponse = {
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
            lat: 195, // Invalid latitude (> 90)
            lng: 103.8201,
            timestamp: new Date().toISOString(),
            speed: 12.5,
            course: 45.2,
          },
        },
        timestamp: new Date().toISOString(),
      }

      // Simulate API response
      const apiResponse: ApiResponse<unknown> = invalidResponse

      expect(() => validators.vessels.getById(apiResponse)).toThrow(
        ApiValidationError,
      )
    })
  })

  describe('Area Response Validation', () => {
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
            { lat: 1.2, lng: 103.9 },
          ],
          monitoringConfig: {
            vesselCriteria: [
              { type: 'type', value: ['Tanker', 'Cargo'] },
              { type: 'flag', value: 'Singapore' },
            ],
            alertTypes: ['entry', 'exit', 'dwell'],
            schedule: {
              enabled: true,
              startTime: '08:00',
              endTime: '18:00',
              timezone: 'Asia/Singapore',
            },
          },
          status: 'active',
          creditsPerDay: 10,
          vesselsInArea: 5,
          alerts: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      }

      // Simulate API response
      const apiResponse: ApiResponse<unknown> = mockResponse

      const validatedData = validators.areas.create(apiResponse)
      expect(validatedData.data.name).toBe('Singapore Anchorage')
      expect(validatedData.data.type).toBe('anchorage')
    })

    it('should catch invalid area type', () => {
      const invalidResponse = {
        success: true,
        data: {
          id: 'a1',
          name: 'Test Area',
          type: 'invalid_type', // Invalid type (not in enum)
          coordinates: [{ lat: 1.2, lng: 103.8 }],
          monitoringConfig: {
            vesselCriteria: [],
            alertTypes: [],
          },
          status: 'active',
          creditsPerDay: 10,
          vesselsInArea: 0,
          alerts: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      }

      // Simulate API response
      const apiResponse: ApiResponse<unknown> = invalidResponse

      expect(() => validators.areas.getById(apiResponse)).toThrow(
        ApiValidationError,
      )
    })
  })

  describe('Error Handling and Validation', () => {
    it('should provide helpful error messages for validation failures', () => {
      const invalidResponse = {
        success: true,
        data: {
          current: -500, // Negative credits not allowed
          lifetime: 1000,
          expiringCredits: [],
        },
        timestamp: new Date().toISOString(),
      }

      // Simulate how we'd handle validation errors in practice
      const validateCreditBalance = (data: unknown) => {
        try {
          return validators.credits.balance(data)
        } catch (error) {
          if (error instanceof ApiValidationError) {
            // Log validation errors for debugging
            console.error(
              'Credit balance validation failed:',
              error.validationErrors,
            )
            throw new Error('Invalid credit balance data received from server')
          }
          throw error
        }
      }

      expect(() => validateCreditBalance(invalidResponse)).toThrow(
        'Invalid credit balance data received from server',
      )
    })

    it('should handle missing required fields gracefully', () => {
      const incompleteResponse = {
        success: true,
        data: {
          id: 'r1',
          name: 'Test Report',
          // Missing required fields: type, status, vesselId, etc.
        },
        timestamp: new Date().toISOString(),
      }

      // Simulate how we'd handle this in the app
      const validateReport = (data: unknown) => {
        try {
          return validators.reports.getById(data)
        } catch (error) {
          if (error instanceof ApiValidationError) {
            // Could implement fallback or retry logic here
            const missingFields = error.validationErrors
              .filter(
                (e) => e.code === 'invalid_type' && e.received === 'undefined',
              )
              .map((e) => e.path.join('.'))

            throw new Error(
              `Received incomplete report data. Missing fields: ${missingFields.join(', ')}`,
            )
          }
          throw error
        }
      }

      expect(() => validateReport(incompleteResponse)).toThrow(
        /Received incomplete report data/,
      )
    })
    it('should validate complex nested structures', () => {
      const complexResponse = {
        success: true,
        data: [
          {
            id: 'inv1',
            title: 'Vessel Activity Investigation',
            type: 'anomaly',
            status: 'in_progress',
            priority: 'high',
            description: 'Investigating unusual vessel patterns',
            vesselIds: ['v1', 'v2'],
            areaIds: ['a1'],
            dateRange: {
              start: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              end: new Date().toISOString(),
            },
            creditsCost: 250,
            findings: null,
            recommendations: null,
            attachments: [
              {
                id: 'att1',
                name: 'vessel-tracks.pdf',
                url: 'https://api.example.com/files/att1',
                type: 'application/pdf',
                size: 1024000,
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: null,
          },
        ],
        timestamp: new Date().toISOString(),
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      }

      // Should validate without errors
      const validatedData = validators.investigations.list(complexResponse)
      expect(validatedData.data).toHaveLength(1)
      expect(validatedData.data[0].priority).toBe('high')
      expect(validatedData.data[0].attachments).toHaveLength(1)
    })

    it('should provide clear error paths for nested validation failures', () => {
      const invalidNestedResponse = {
        success: true,
        data: {
          id: 'a1',
          name: 'Test Area',
          type: 'port',
          coordinates: [
            { lat: 1.2, lng: 103.8 },
            { lat: 'invalid', lng: 103.9 }, // Invalid latitude type
          ],
          monitoringConfig: {
            vesselCriteria: [
              { type: 'flag', value: 123 }, // Invalid value type
            ],
            alertTypes: ['entry', 'exit'],
          },
          status: 'active',
          creditsPerDay: 10,
          vesselsInArea: 0,
          alerts: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      }

      try {
        validators.areas.getById(invalidNestedResponse)
        expect.fail('Should have thrown validation error')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiValidationError)
        if (error instanceof ApiValidationError) {
          // Check that we get clear error paths
          const latError = error.validationErrors.find(
            (e) => e.path.join('.') === 'data.coordinates.1.lat',
          )
          expect(latError).toBeDefined()
          expect(latError?.code).toBe('invalid_type')
        }
      }
    })
  })
})
