import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Server Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    // Clear the module cache to ensure fresh imports
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('JWT_SECRET validation', () => {
    it('should throw error if JWT_SECRET is not set', async () => {
      delete process.env.JWT_SECRET;
      
      await expect(async () => {
        await import('./config');
      }).rejects.toThrow('JWT_SECRET environment variable is required');
    });

    it('should throw error if JWT_SECRET is default/insecure value', async () => {
      process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
      
      await expect(async () => {
        await import('./config');
      }).rejects.toThrow('JWT_SECRET must be changed from default value');
    });

    it('should throw error if JWT_SECRET is too short', async () => {
      process.env.JWT_SECRET = 'short';
      
      await expect(async () => {
        await import('./config');
      }).rejects.toThrow('JWT_SECRET must be at least 32 characters long');
    });

    it('should accept valid JWT_SECRET', async () => {
      process.env.JWT_SECRET = 'a-very-secure-secret-key-that-is-long-enough-and-random';
      
      const config = await import('./config');
      expect(config.JWT_SECRET).toBe('a-very-secure-secret-key-that-is-long-enough-and-random');
    });
  });

  describe('NODE_ENV validation', () => {
    it('should default to development if NODE_ENV not set', async () => {
      delete process.env.NODE_ENV;
      process.env.JWT_SECRET = 'a-very-secure-secret-key-that-is-long-enough-and-random';
      
      const config = await import('./config');
      expect(config.NODE_ENV).toBe('development');
    });

    it('should use provided NODE_ENV value', async () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'a-very-secure-secret-key-that-is-long-enough-and-random';
      
      const config = await import('./config');
      expect(config.NODE_ENV).toBe('production');
    });
  });

  describe('Production environment checks', () => {
    it('should log warning in development with insecure JWT_SECRET', async () => {
      process.env.NODE_ENV = 'development';
      process.env.JWT_SECRET = 'development-only-secret-key-for-testing-purposes';
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      await import('./config');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[SECURITY WARNING]')
      );
      
      consoleSpy.mockRestore();
    });
  });
});