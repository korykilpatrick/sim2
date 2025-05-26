import { describe, it, expect } from 'vitest';
import { creditAdapter } from '@/features/credits/services/creditAdapter';
import type { 
  CreditBalance as SharedCreditBalance,
  CreditTransaction as SharedCreditTransaction 
} from '@/features/shared/types/credits';
import type { 
  CreditBalance as FeaturesCreditBalance,
  CreditTransaction as FeaturesCreditTransaction,
  ApiResponse 
} from '@/features/credits/services/creditService';

describe('creditAdapter', () => {
  describe('toSharedFormat', () => {
    it('should convert features credit balance to shared format', () => {
      const featuresBalance: FeaturesCreditBalance = {
        current: 1000,
        lifetime: 5000,
        expiringCredits: [
          { amount: 100, expiresAt: '2025-02-01T00:00:00Z' },
          { amount: 200, expiresAt: '2025-03-01T00:00:00Z' }
        ]
      };

      const result = creditAdapter.toSharedFormat(featuresBalance);

      expect(result).toEqual({
        available: 1000,
        lifetime: 5000,
        expiring: {
          amount: 100,
          date: '2025-02-01T00:00:00Z'
        }
      });
    });

    it('should handle empty expiring credits', () => {
      const featuresBalance: FeaturesCreditBalance = {
        current: 500,
        lifetime: 1000,
        expiringCredits: []
      };

      const result = creditAdapter.toSharedFormat(featuresBalance);

      expect(result).toEqual({
        available: 500,
        lifetime: 1000,
        expiring: null
      });
    });

    it('should handle missing expiring credits', () => {
      const featuresBalance: FeaturesCreditBalance = {
        current: 500,
        lifetime: 1000
      };

      const result = creditAdapter.toSharedFormat(featuresBalance);

      expect(result).toEqual({
        available: 500,
        lifetime: 1000,
        expiring: null
      });
    });

    it('should convert transaction types correctly', () => {
      const featuresTransaction: FeaturesCreditTransaction = {
        id: '123',
        amount: 100,
        type: 'usage',
        description: 'Test',
        createdAt: '2025-01-26T00:00:00Z',
        balanceAfter: 900
      };

      const result = creditAdapter.transactionToSharedFormat(featuresTransaction);

      expect(result.type).toBe('deduction');
    });
  });

  describe('toFeaturesFormat', () => {
    it('should convert shared credit balance to features format', () => {
      const sharedBalance: SharedCreditBalance = {
        available: 1000,
        lifetime: 5000,
        expiring: {
          amount: 100,
          date: '2025-02-01T00:00:00Z'
        }
      };

      const result = creditAdapter.toFeaturesFormat(sharedBalance);

      expect(result).toEqual({
        current: 1000,
        lifetime: 5000,
        expiringCredits: [
          { amount: 100, expiresAt: '2025-02-01T00:00:00Z' }
        ]
      });
    });

    it('should handle null expiring credits', () => {
      const sharedBalance: SharedCreditBalance = {
        available: 500,
        lifetime: 1000,
        expiring: null
      };

      const result = creditAdapter.toFeaturesFormat(sharedBalance);

      expect(result).toEqual({
        current: 500,
        lifetime: 1000,
        expiringCredits: []
      });
    });

    it('should convert transaction types correctly', () => {
      const sharedTransaction: SharedCreditTransaction = {
        id: '123',
        userId: 'user1',
        amount: -100,
        type: 'deduction',
        description: 'Test',
        createdAt: '2025-01-26T00:00:00Z',
        metadata: {}
      };

      const result = creditAdapter.transactionToFeaturesFormat(sharedTransaction);

      expect(result.type).toBe('usage');
      expect(result.amount).toBe(100); // Features format uses positive amounts
    });
  });

  describe('wrapResponse', () => {
    it('should wrap data in API response format', () => {
      const data = { test: 'data' };
      const result = creditAdapter.wrapResponse(data);

      expect(result).toMatchObject({
        success: true,
        data,
        timestamp: expect.any(String)
      });
    });

    it('should handle errors', () => {
      const error = new Error('Test error');
      const result = creditAdapter.wrapResponse(null, error);

      expect(result).toMatchObject({
        success: false,
        error: {
          message: 'Test error',
          code: 'UNKNOWN_ERROR'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('unwrapResponse', () => {
    it('should extract data from wrapped response', () => {
      const wrapped: ApiResponse<any> = {
        success: true,
        data: { test: 'data' },
        timestamp: new Date().toISOString()
      };

      const result = creditAdapter.unwrapResponse(wrapped);

      expect(result).toEqual({ test: 'data' });
    });

    it('should throw on error response', () => {
      const wrapped: ApiResponse<any> = {
        success: false,
        error: {
          message: 'Test error',
          code: 'TEST_ERROR'
        },
        timestamp: new Date().toISOString()
      };

      expect(() => creditAdapter.unwrapResponse(wrapped)).toThrow('Test error');
    });
  });

  describe('adaptCreditBalance', () => {
    it('should adapt between formats bidirectionally', () => {
      const original: FeaturesCreditBalance = {
        current: 1500,
        lifetime: 3000,
        expiringCredits: [
          { amount: 250, expiresAt: '2025-04-01T00:00:00Z' }
        ]
      };

      // Convert to shared and back
      const shared = creditAdapter.toSharedFormat(original);
      const converted = creditAdapter.toFeaturesFormat(shared);

      expect(converted).toEqual(original);
    });
  });

  describe('adaptTransactions', () => {
    it('should handle arrays of transactions', () => {
      const transactions: FeaturesCreditTransaction[] = [
        {
          id: '1',
          amount: 100,
          type: 'purchase',
          description: 'Credit purchase',
          createdAt: '2025-01-01T00:00:00Z',
          balanceAfter: 1100
        },
        {
          id: '2',
          amount: 50,
          type: 'usage',
          description: 'Service usage',
          createdAt: '2025-01-02T00:00:00Z',
          balanceAfter: 1050
        }
      ];

      const shared = creditAdapter.transactionsToSharedFormat(transactions);

      expect(shared).toHaveLength(2);
      expect(shared[0].type).toBe('purchase');
      expect(shared[1].type).toBe('deduction');
    });
  });
});