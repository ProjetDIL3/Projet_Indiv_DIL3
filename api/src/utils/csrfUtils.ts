import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import CustomError from './CustomError';

const csrfTokens = new Map<string, string>();

export const csrfUtils = {
  generateCSRFToken(): string {
    return uuidv4();
  },

  storeCSRFToken(userId: string, token: string): void {
    csrfTokens.set(userId, token);
  },

  getCSRFToken(userId: string): string | undefined {
    return csrfTokens.get(userId);
  },

  deleteCSRFToken(userId: string): void {
    csrfTokens.delete(userId);
  },

  validateCSRFToken(userId: string, token: string): boolean {
    return csrfTokens.get(userId) === token;
  },

  csrfProtection(req: Request, res: Response, next: NextFunction): void {
    if (req.method === 'GET') return next();
    
    const userId = req.user?.userId;
    const csrfToken = req.headers['x-xsrf-token'] as string;

    if (!userId || !csrfToken || !this.validateCSRFToken(userId, csrfToken)) {
      return next(new CustomError(403, 'Token CSRF pas valide'));
    }
    next();
  }
};
