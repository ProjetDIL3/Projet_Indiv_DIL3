import { Router } from 'express';
import { GeocodingController } from '../controllers/GeocodingController';

const router = Router();

router.get('/reverse-geocode', GeocodingController.reverseGeocode);
router.get('/geocode', GeocodingController.geocodeAddress);

export default router;
