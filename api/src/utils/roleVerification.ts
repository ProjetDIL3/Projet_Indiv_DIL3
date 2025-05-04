import { Request, Response, NextFunction } from 'express';
import CustomError from './CustomError';
import { UserService } from '../services/UserService';

// Middleware pour vérifier si l'utilisateur a le rôle d'administrateur
export const requireAdminRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return next(new CustomError(401, 'Utilisateur non authentifié'));
    }

    const user = await UserService.getUserById(userId);

    if (!user || !user.RoleAdmin) {
      return next(new CustomError(403, 'Accès refusé : permissions insuffisantes'));
    }

    next();
  } catch (error: any) {
    return next(new CustomError(500, 'Erreur interne du serveur'));
  }
};
