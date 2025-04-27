// src/controllers/AuthController.ts
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { jwtUtils } from '../utils/jwtUtils';
import { csrfUtils } from '../utils/csrfUtils';
import { refreshTokenService } from '../services/refreshTokenService';
import { UserService } from '../services/UserService';
import CustomError from '../utils/CustomError';


export class AuthController {
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { Email, password } = req.body;
            const user = await AuthService.login(Email, password);
            if (!user) {
                throw new CustomError(401, 'Identifiants non valides');
            }

            const accessToken = jwtUtils.generateAccessToken(user);
            const refreshToken = jwtUtils.generateRefreshToken(user);
            const csrfToken = csrfUtils.generateCSRFToken();

            await refreshTokenService.save(
                jwtUtils.verifyRefreshToken(refreshToken).jti || (() => { throw new CustomError(400, 'Invalid token ID'); })(),
                user.IdUtilisateur,
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            );

            csrfUtils.storeCSRFToken(user.IdUtilisateur, csrfToken);

            res.json({
                accessToken,
                refreshToken,
                csrfToken,
                user: {
                    IdUtilisateur: user.IdUtilisateur,
                    RoleAdmin: user.RoleAdmin
                }
            });
        } catch (error) {
            next(error); 
        }
    }

    static async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            const decoded = jwtUtils.verifyRefreshToken(refreshToken);
    
            if (!decoded.jti) throw new CustomError(400, 'Token ID non valido');
            const validToken = await refreshTokenService.findValidToken(decoded.jti);
            if (!validToken) throw new CustomError(401, 'Refresh token non valido');
    
            const user = await UserService.getUserById(decoded.userId);
            if (!user) throw new CustomError(404, 'Utente non trovato');
    
            const newAccessToken = jwtUtils.generateAccessToken(user);
            const newCsrfToken = csrfUtils.generateCSRFToken();
            csrfUtils.storeCSRFToken(user.IdUtilisateur, newCsrfToken);
    
            res.json({ accessToken: newAccessToken, csrfToken: newCsrfToken });
        } catch (error) {
            next(error); 
        }
    } 
    
    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) throw new CustomError(400, 'Refresh token obbligatorio');
    
            const decoded = jwtUtils.verifyRefreshToken(refreshToken);
            if (!decoded.jti) throw new CustomError(400, 'Token ID non valido');
            
            await refreshTokenService.revoke(decoded.jti);
            csrfUtils.deleteCSRFToken(decoded.userId);
    
            res.status(200).json({ message: 'Logout effettuato con successo' });
        } catch (error) {
            next(error); 
        }
    }
    
}

