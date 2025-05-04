// GeocodingController.ts
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import CustomError from '../utils/CustomError';

export class GeocodingController {
  static async reverseGeocode(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) throw new CustomError(400, 'Parametri lat/lon mancanti');

      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: { lat, lon, format: 'json' },
        headers: { 'User-Agent': 'MagicEventsApp' }
      });

      res.json(response.data);
    } catch (error) {
      next(error);
    }
  }

  static async geocodeAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.query;
      if (!address) throw new CustomError(400, 'Parametro address mancante');

      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: address, format: 'json', addressdetails: 1, limit: 5 },
        headers: { 'User-Agent': 'MagicEventsApp' }
      });

      res.json(response.data);
    } catch (error) {
      next(error);
    }
  }
}
