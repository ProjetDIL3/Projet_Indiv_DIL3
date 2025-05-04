import { User } from "../interfaces/User";
import { pool } from "../config/dbConfig";
import bcrypt from "bcrypt";
import CustomError from '../utils/CustomError';


export class AuthService {
  
  // Connecte l'utilisateur et vérifie ses identifiants
  static async login(Email: string, password: string): Promise<User | null> {
    const request = pool.request();

    const result = await request
      .input('Email', Email)
      .query(`SELECT IdUtilisateur, Nom, Prenom, Email, Mdepasse, RoleAdmin FROM Utilisateurs WHERE Email = @Email`);

    const user = result.recordset[0];

    if (!user) {
      throw new CustomError(401, 'Identifiants non valides');
    }

    const passwordMatch = await bcrypt.compare(password, user.Mdepasse);
    
    if (!passwordMatch) {
      throw new CustomError(401, 'Identifiants non valides');
    } 

    delete user.Mdepasse; // Supprime le mot de passe du résultat, pour des raisons de sécurité
    return user;
  }
}
