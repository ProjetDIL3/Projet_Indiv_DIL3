import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connectToDatabase } from './config/dbConfig';
import 'dotenv/config';
import CustomError from './utils/CustomError';
import authRoutes from './routes/authRoutes'; 


const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);


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
