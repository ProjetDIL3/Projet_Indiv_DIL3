// src/controllers/AuthController.ts
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { jwtUtils } from '../utils/jwtUtils';
import { csrfUtils } from '../utils/csrfUtils';
import { refreshTokenService } from '../services/refreshTokenService';
import { UserService } from '../services/UserService';
import CustomError from '../utils/CustomError';
import { validateLoginInput } from '../utils/validationUtils';



export class AuthController {
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { Email, password } = req.body;

            const validationErrors = validateLoginInput(Email, password);
            if (validationErrors.length > 0) {
                throw new CustomError(400, validationErrors.join(', '));
            }

            const user = await AuthService.login(Email, password);
            if (!user) {
                throw new CustomError(401, 'Identifiants non valides');
            }

            const accessToken = jwtUtils.generateAccessToken(user);
            const refreshToken = jwtUtils.generateRefreshToken(user);
            const csrfToken = csrfUtils.generateCSRFToken();

            await refreshTokenService.save(
                jwtUtils.verifyRefreshToken(refreshToken).jti || (() => { throw new CustomError(400, 'ID de token invalide'); })(),
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
    
            if (!decoded.jti) throw new CustomError(400, 'ID de token invalide');
            const validToken = await refreshTokenService.findValidToken(decoded.jti);
            if (!validToken) throw new CustomError(401, 'Refresh token invalide');
    
            const user = await UserService.getUserById(decoded.userId);
            if (!user) throw new CustomError(404, 'Utilisateur non trouvé');
    
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
            if (!refreshToken) throw new CustomError(400, 'Refresh token obligatoire');
    
            const decoded = jwtUtils.verifyRefreshToken(refreshToken);
            if (!decoded.jti) throw new CustomError(400, 'ID de token non valide');
            
            await refreshTokenService.revoke(decoded.jti);
            csrfUtils.deleteCSRFToken(decoded.userId);
    
            res.status(200).json({ message: 'Déconnexion effectuée avec succès' });
        } catch (error) {
            next(error); 
        }
    }
    
}

