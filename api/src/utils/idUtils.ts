import { pool } from '../config/dbConfig';

// Fonction pour générer un nouvel ID basé sur le nom de la table et le nom de la colonne d'ID
export async function generateNextId(tableName: string, idColumnName: string): Promise<string> {
  const prefix = tableName.toLowerCase().substring(0, 3);
  const request = pool.request();
  
  const result = await request.query(`
    SELECT MAX(${idColumnName}) as maxId 
    FROM ${tableName} 
    WHERE ${idColumnName} LIKE '${prefix}%'
  `);
  
  const maxId = result.recordset[0]?.maxId;
  let numericPart = maxId ? parseInt(maxId.slice(3), 10) + 1 : 0;
  
  return `${prefix}${numericPart.toString().padStart(7, '0')}`;
}