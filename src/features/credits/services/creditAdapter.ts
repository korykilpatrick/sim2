/**
 * Credit System Adapter
 * 
 * Provides bidirectional conversion between the two credit system implementations
 * to ensure backwards compatibility during the consolidation process.
 */

import type { 
  CreditBalance as SharedCreditBalance,
  CreditTransaction as SharedCreditTransaction
} from '@/features/shared/types/credits';

// Re-export types from features/credits for now
export interface CreditBalance {
  current: number;
  lifetime: number;
  expiringCredits?: Array<{
    amount: number;
    expiresAt: string;
  }>;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  type: 'purchase' | 'usage' | 'refund';
  description: string;
  createdAt: string;
  balanceAfter: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
  timestamp: string;
}

export const creditAdapter = {
  /**
   * Convert features credit format to shared format
   */
  toSharedFormat(balance: CreditBalance): SharedCreditBalance {
    const firstExpiring = balance.expiringCredits?.[0];
    
    return {
      available: balance.current,
      lifetime: balance.lifetime,
      expiring: firstExpiring 
        ? {
            amount: firstExpiring.amount,
            date: firstExpiring.expiresAt
          }
        : null
    };
  },

  /**
   * Convert shared credit format to features format
   */
  toFeaturesFormat(balance: SharedCreditBalance): CreditBalance {
    return {
      current: balance.available,
      lifetime: balance.lifetime,
      expiringCredits: balance.expiring 
        ? [{
            amount: balance.expiring.amount,
            expiresAt: balance.expiring.date
          }]
        : []
    };
  },

  /**
   * Convert features transaction to shared format
   */
  transactionToSharedFormat(transaction: CreditTransaction): SharedCreditTransaction {
    // Map transaction types
    let type: SharedCreditTransaction['type'] = 'purchase';
    if (transaction.type === 'usage') {
      type = 'deduction';
    } else if (transaction.type === 'refund') {
      type = 'refund';
    }

    return {
      id: transaction.id,
      amount: transaction.type === 'usage' ? -transaction.amount : transaction.amount,
      balance: transaction.balanceAfter,
      type,
      description: transaction.description,
      createdAt: transaction.createdAt
    };
  },

  /**
   * Convert shared transaction to features format
   */
  transactionToFeaturesFormat(transaction: SharedCreditTransaction): CreditTransaction {
    // Map transaction types
    let type: 'purchase' | 'usage' | 'refund' = 'purchase';
    if (transaction.type === 'deduction') {
      type = 'usage';
    } else if (transaction.type === 'refund') {
      type = 'refund';
    }

    return {
      id: transaction.id,
      amount: Math.abs(transaction.amount), // Features format uses positive amounts
      type,
      description: transaction.description,
      createdAt: transaction.createdAt,
      balanceAfter: 0 // Will be calculated by service
    };
  },

  /**
   * Convert arrays of transactions
   */
  transactionsToSharedFormat(transactions: CreditTransaction[]): SharedCreditTransaction[] {
    return transactions.map(t => this.transactionToSharedFormat(t));
  },

  transactionsToFeaturesFormat(transactions: SharedCreditTransaction[]): CreditTransaction[] {
    return transactions.map(t => this.transactionToFeaturesFormat(t));
  },

  /**
   * Wrap response in API format used by features/credits
   */
  wrapResponse<T>(data: T | null, error?: Error): ApiResponse<T> {
    if (error || !data) {
      return {
        success: false,
        error: {
          message: error?.message || 'Unknown error',
          code: 'UNKNOWN_ERROR'
        },
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Unwrap API response to get raw data
   */
  unwrapResponse<T>(response: ApiResponse<T>): T {
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Unknown error');
    }
    return response.data;
  },

  /**
   * Adapt API response from shared to features format
   */
  async adaptBalanceResponse(
    sharedResponse: Promise<SharedCreditBalance>
  ): Promise<ApiResponse<CreditBalance>> {
    try {
      const sharedBalance = await sharedResponse;
      const featuresBalance = this.toFeaturesFormat(sharedBalance);
      return this.wrapResponse(featuresBalance);
    } catch (error) {
      return this.wrapResponse<CreditBalance>(null, error as Error);
    }
  },

  /**
   * Adapt API response from shared to features format for transactions
   */
  async adaptTransactionsResponse(
    sharedResponse: Promise<SharedCreditTransaction[]>
  ): Promise<ApiResponse<CreditTransaction[]>> {
    try {
      const sharedTransactions = await sharedResponse;
      const featuresTransactions = this.transactionsToFeaturesFormat(sharedTransactions);
      return this.wrapResponse(featuresTransactions);
    } catch (error) {
      return this.wrapResponse<CreditTransaction[]>(null, error as Error);
    }
  }
};