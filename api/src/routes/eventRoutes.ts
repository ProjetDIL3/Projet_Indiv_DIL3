import { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { jwtUtils } from '../utils/jwtUtils';
import { csrfUtils } from '../utils/csrfUtils';


const router = Router();

// Middleware partagés pour toutes les routes protégées
const protectedRoutesMiddleware = [
  jwtUtils.authenticateJWT, 
  csrfUtils.csrfProtection.bind(csrfUtils)
];

router.post('/', 
  protectedRoutesMiddleware, 
  EventController.createEvent
);

router.put('/:id', 
  protectedRoutesMiddleware,
  EventController.updateEvent
);

router.delete('/:id', 
  protectedRoutesMiddleware,
  EventController.deleteEvent
);

router.post('/generate-events', 
  protectedRoutesMiddleware,
  EventController.generateRandomEvents
);


// Route publique (sans middleware)
router.get('/', EventController.getAllEvents);
router.get('/:id', EventController.getEventById)


export default router