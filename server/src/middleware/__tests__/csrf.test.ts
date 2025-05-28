import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { validateCSRFToken, setCSRFToken } from '../csrf';

describe('CSRF Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      cookies: {},
      body: {},
      headers: {},
      path: '',
    };
    res = {
      cookie: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      setHeader: vi.fn(),
    };
    next = vi.fn();
  });

  describe('setCSRFToken', () => {
    it('should set CSRF token cookie', () => {
      setCSRFToken(req as Request, res as Response, next);

      expect(res.cookie).toHaveBeenCalledWith(
        'csrf-token',
        expect.any(String),
        expect.objectContaining({
          secure: false, // In test/dev environment
          sameSite: 'strict',
          maxAge: 60 * 60 * 1000, // 1 hour
          // Note: CSRF tokens are NOT httpOnly so JavaScript can read them
        })
      );
      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateCSRFToken', () => {
    it('should pass validation with matching tokens', () => {
      const token = 'valid-csrf-token';
      req.cookies = { 'csrf-token': token };
      req.headers = { 'x-csrf-token': token };

      validateCSRFToken(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail validation with mismatched tokens', () => {
      req.cookies = { 'csrf-token': 'token1' };
      req.headers = { 'x-csrf-token': 'token2' };

      validateCSRFToken(req as Request, res as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'CSRF_VALIDATION_FAILED',
        }),
      });
    });

    it('should fail validation with missing CSRF token', () => {
      req.cookies = { 'csrf-token': 'token' };
      // No header token

      validateCSRFToken(req as Request, res as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    describe('auth endpoints protection', () => {
      it('should NOT skip CSRF validation for login endpoint', () => {
        const token = 'valid-token';
        req.path = '/api/v1/auth/login';
        req.cookies = { 'csrf-token': token };
        req.headers = { 'x-csrf-token': token };

        validateCSRFToken(req as Request, res as Response, next);

        // Should validate even for login
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });

      it('should NOT skip CSRF validation for register endpoint', () => {
        const token = 'valid-token';
        req.path = '/api/v1/auth/register';
        req.cookies = { 'csrf-token': token };
        req.headers = { 'x-csrf-token': token };

        validateCSRFToken(req as Request, res as Response, next);

        // Should validate even for register
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });

      it('should require CSRF token for login without token', () => {
        req.path = '/api/v1/auth/login';
        // No tokens provided

        validateCSRFToken(req as Request, res as Response, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: expect.objectContaining({
            code: 'CSRF_VALIDATION_FAILED',
          }),
        });
      });
    });
  });
});