// src/controllers/EventController.ts
import { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/EventService';
import CustomError from '../utils/CustomError';
import { validateEventInput, validateEventUpdateInput } from '../utils/validationUtils';

export class EventController {
    // GET /events
    static async getAllEvents(req: Request, res: Response, next: NextFunction) {
        try {
            const events = await EventService.getAllEvents();
            res.json(events);
        } catch (error) {
            next(error);
        }
    }

    // GET /events/:id
    static async getEventById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const event = await EventService.getEventById(id);
            if (!event) throw new CustomError(404, "Événement non trouvé");
            res.json(event);
        } catch (error) {
            next(error);
        }
    }

    // POST /events
    static async createEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const eventData = req.body;
            
            // Validation des données
            const validationErrors = validateEventInput(eventData);
            if (validationErrors.length > 0) {
                throw new CustomError(400, validationErrors.join(', '));
            }
            
            const event = await EventService.createEvent(eventData);
            res.status(201).json(event);
        } catch (error) {
            next(error);
        }
    }

    // PUT /events/:id
    static async updateEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updates = req.body;
            
            // Vérifier si l'événement existe
            const existingEvent = await EventService.getEventById(id);
            if (!existingEvent) {
                throw new CustomError(404, "Événement non trouvé");
            }
            
            // Validation des données
            const validationErrors = validateEventUpdateInput(updates);
            if (validationErrors.length > 0) {
                throw new CustomError(400, validationErrors.join(', '));
            }
            
            await EventService.updateEvent(id, updates);
            res.status(200).json({ message: "Événement mis à jour avec succès" });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /events/:id
    static async deleteEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            
            // Vérifier si l'événement existe
            const existingEvent = await EventService.getEventById(id);
            if (!existingEvent) {
                throw new CustomError(404, "Événement non trouvé");
            }
            
            await EventService.deleteEvent(id);
            res.status(200).json({ message: "Événement supprimé avec succès" });
        } catch (error) {
            next(error);
        }
    }
}