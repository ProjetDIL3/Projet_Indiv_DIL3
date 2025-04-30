import { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { jwtUtils } from '../utils/jwtUtils';
import { csrfUtils } from '../utils/csrfUtils';

const router = Router();

// Middleware partagés pour toutes les routes protégées
const protectedRoutesMiddleware = [
  jwtUtils.authenticateJWT, 
  csrfUtils.csrfProtection
];

// Route protégée pour la création d'événements
router.post('/events', 
  protectedRoutesMiddleware, 
  EventController.createEvent
);

// Route protégée pour la mise à jour d'événements
router.put('/events/:id', 
  protectedRoutesMiddleware,
  EventController.updateEvent
);

router.delete('/events/:id', 
  protectedRoutesMiddleware,
  EventController.deleteEvent
);



// Route publique (sans middleware)
router.get('/events', EventController.getAllEvents);

export default router