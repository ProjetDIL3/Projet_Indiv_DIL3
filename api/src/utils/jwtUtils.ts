// src/utils/jwtUtils.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../interfaces/User';
import CustomError from './CustomError';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      role: string;
    };
  }
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

export const jwtUtils = {
  generateAccessToken(user: User): string {
    return jwt.sign(
      { userId: user.IdUtilisateur, role: user.RoleAdmin ? 'admin' : 'user' },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );
  },

  generateRefreshToken(user: User): string {
    const tokenId = require('uuid').v4();
    return jwt.sign(
      { jti: tokenId, userId: user.IdUtilisateur },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );
  },

  verifyAccessToken(token: string): jwt.JwtPayload {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as jwt.JwtPayload;
  },

  verifyRefreshToken(token: string): jwt.JwtPayload {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as jwt.JwtPayload;
  },

  authenticateJWT(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(new CustomError(401, "Token mancante"));
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as jwt.JwtPayload;
      req.user = { userId: decoded.userId, role: decoded.role };
      next();
    } catch (error) {
      next(new CustomError(401, "Token invalido o scaduto"));
    }
  }
};
