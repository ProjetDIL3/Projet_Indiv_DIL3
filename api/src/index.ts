import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { connectToDatabase } from './config/dbConfig';
import 'dotenv/config';
import CustomError from './utils/CustomError';
import authRoutes from './routes/authRoutes'; 
import eventRoutes from './routes/eventRoutes';
import formatRoutes from './routes/formatRoutes';
import shopRoutes from './routes/shopRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Créer le dossier d'uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, '../uploads');
const eventsUploadsDir = path.join(uploadsDir, 'events');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(eventsUploadsDir)) {
  fs.mkdirSync(eventsUploadsDir);
}


app.use('/uploads', express.static(uploadsDir));

const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/formats', formatRoutes);
app.use('/shops', shopRoutes); 

// Custom error
app.use((err: Error, req: Request, res: Response, next: NextFunction) => { 
  if (err instanceof CustomError) {
    res.status(err.statusCode).json({ 
      error: err.message,
      code: err.statusCode,
    });
  } else {
    console.error(err);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      code: 500 
    });
  }
});

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Serveur en écoute sur http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Erreur de connexion à la base de données :', err);
    process.exit(1);
  });