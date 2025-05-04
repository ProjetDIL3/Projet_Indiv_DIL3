import { pool } from '../config/dbConfig';
import { Shop } from '../interfaces/Shop';
import mssql from 'mssql';
import CustomError from '../utils/CustomError';

export class ShopService {

// Récupère tous les magasins
  static async getAllShops(): Promise<Shop[]> {
    try {
      const result = await pool.request().query(`
        SELECT * FROM Magasins
        ORDER BY Nom ASC
      `);
      return result.recordset as Shop[];
    } catch (error) {
      throw new CustomError(500, "Erreur lors de la récupération des magasins");
    }
  }

  // Récupère les détails d'un magasin par ID
  static async getShopById(shopId: string): Promise<Shop | null> {
    try {
      const result = await pool.request()
        .input('IdMagasin', mssql.NChar(10), shopId)
        .query(`
          SELECT *
          FROM Magasins
          WHERE IdMagasin = @IdMagasin
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      return result.recordset[0] as Shop;
    } catch (error) {
      throw new CustomError(500, "Erreur lors de la récupération du magasin");
    }
  }
}