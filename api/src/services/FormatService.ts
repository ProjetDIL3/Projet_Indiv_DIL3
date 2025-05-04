import { pool } from '../config/dbConfig';
import mssql from 'mssql';
import CustomError from '../utils/CustomError';

interface Format {
    IdFormat: string;
    NomFormat: string;
    Link: string;
}

export class FormatService {
    //Recupère tous les formats disponibles
    static async getAllFormats(): Promise<Format[]> {
        try {
            const result = await pool.request().query(`
                SELECT IdFormat, NomFormat, Link
                FROM Formats
                ORDER BY NomFormat ASC
            `);
            return result.recordset as Format[];
        } catch (error) {
            throw new CustomError(500, "Erreur lors de la récupération des formats");
        }
    }

    //Recupère les détails d'un format par ID
    static async getFormatById(formatId: string): Promise<Format | null> {
        try {
            const result = await pool.request()
                .input('IdFormat', mssql.NChar(10), formatId)
                .query(`
                    SELECT IdFormat, NomFormat, Link
                    FROM Formats
                    WHERE IdFormat = @IdFormat
                `);

            if (result.recordset.length === 0) {
                return null;
            }

            return result.recordset[0] as Format;
        } catch (error) {
            throw new CustomError(500, "Erreur lors de la récupération du format");
        }
    }
}
