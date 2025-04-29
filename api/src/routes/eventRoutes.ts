import { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { jwtUtils } from '../utils/jwtUtils';
import { csrfUtils } from '../utils/csrfUtils';

const router = Router();

// Middleware condivisi per tutte le route protette
const protectedRoutesMiddleware = [
  jwtUtils.authenticateJWT, 
  csrfUtils.csrfProtection
];

// Route protetta per la creazione eventi
router.post('/events', 
  protectedRoutesMiddleware, 
  EventController.createEvent
);

// Route protetta per l'aggiornamento eventi
router.put('/events/:id', 
  protectedRoutesMiddleware,
  EventController.updateEvent
);

router.delete('/events/:id', 
  protectedRoutesMiddleware,
  EventController.deleteEvent
);



// Route pubblica (senza middleware)
router.get('/events', EventController.getAllEvents);

export default router