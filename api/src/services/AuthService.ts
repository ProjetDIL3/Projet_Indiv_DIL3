import { User } from "../interfaces/User";
import { pool } from "../config/dbConfig";
import bcrypt from "bcrypt";
import CustomError from '../utils/CustomError';


export class AuthService {
  
  /**
   * Connecte l'utilisateur
   */
  static async login(Email: string, password: string): Promise<User | null> {
    const request = pool.request();

    const result = await request
      .input('Email', Email)
      .query(`SELECT IdUtilisateur, Nom, Prenom, Email, Mdepasse, RoleAdmin FROM Utilisateurs WHERE Email = @Email`);

    const user = result.recordset[0];



    // Compare le mot de passe chiffré
    const passwordMatch = await bcrypt.compare(password, user.Mdepasse);
    
    if (!passwordMatch) {
      throw new CustomError(401, 'Identifiants non valides');
    } 

    delete user.Mdepasse; // Supprime le mot de passe du résultat
    return user;
  }
}
