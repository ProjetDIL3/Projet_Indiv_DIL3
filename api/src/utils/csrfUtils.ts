import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import CustomError from './CustomError';

interface CSRFTokenInfo {
  token: string;
  expiresAt: Date;
}

const csrfTokens = new Map<string, CSRFTokenInfo>();

export const csrfUtils = {
  generateCSRFToken(): string {
    return uuidv4();
  },

  storeCSRFToken(userId: string, token: string): void {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 20);
    csrfTokens.set(userId, { token, expiresAt });
  },

  getCSRFToken(userId: string): string | undefined {
    const tokenInfo = csrfTokens.get(userId);
    if (!tokenInfo) return undefined;
    
    if (new Date() > tokenInfo.expiresAt) {
      this.deleteCSRFToken(userId);
      return undefined;
    }
    
    return tokenInfo.token;
  },

  deleteCSRFToken(userId: string): void {
    csrfTokens.delete(userId);
  },

  validateCSRFToken(userId: string, token: string): boolean {
    const storedToken = csrfTokens.get(userId);
    if (!storedToken) return false;
    
    if (new Date() > storedToken.expiresAt) {
      this.deleteCSRFToken(userId);
      return false;
    }
    
    return storedToken.token === token;
  },

  csrfProtection(req: Request, res: Response, next: NextFunction): void {
    if (req.method === 'GET') return next();
    
    const userId = req.user?.userId;
    const csrfToken = req.headers['x-xsrf-token'] as string;

    if (userId && !this.getCSRFToken(userId) && csrfToken) {
      this.storeCSRFToken(userId, csrfToken);
      return next();
    }

    if (!userId || !csrfToken || !this.validateCSRFToken(userId, csrfToken)) {
      return next(new CustomError(403, 'Token CSRF pas valide ou expiré'));
    }
    next();
  }
};