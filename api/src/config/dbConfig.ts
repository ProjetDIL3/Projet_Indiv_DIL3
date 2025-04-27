import mssql from 'mssql';
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis un fichier .env
dotenv.config();

const dbConfig: mssql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME,
  options: {
    encrypt: true, 
    trustServerCertificate: true 
  },
  port: parseInt(process.env.DB_PORT || '1433')
};

let pool: mssql.ConnectionPool;

export async function connectToDatabase(): Promise<mssql.ConnectionPool> {
  try {
    pool = new mssql.ConnectionPool(dbConfig);
    await pool.connect();
    console.log('Connecté à la base de données');
    return pool;
  } catch (err) {
    console.error('Erreur de connexion à la base de données:', err);
    throw err;
  }
}

export { pool };
