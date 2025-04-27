import { User } from '../interfaces/User';
import { pool } from '../config/dbConfig';
import mssql from 'mssql';
import CustomError from '../utils/CustomError';



export class UserService {
  /**
   * Récupère un profil d'utilisateur par ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await pool.request()
        .input('IdUtilisateur', mssql.NChar(10), userId)
        .query(`
          SELECT 
            IdUtilisateur,
            RoleAdmin
          FROM Utilisateurs
          WHERE IdUtilisateur = @IdUtilisateur
        `);

        if (result.recordset.length === 0) {
          return null;
        }
  
        const user = result.recordset[0] as User;
        return {
          ...user
        };
      } catch (error) {
        throw new CustomError(500, "Erreur lors de la récupération de l'utilisateur");
      }
    }
  }

  