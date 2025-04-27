// src/controllers/EventController.ts
import { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/EventService';
import CustomError from '../utils/CustomError';

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
            await EventService.deleteEvent(id);
            res.status(200).json({ message: "Événement supprimé avec succès" });
        } catch (error) {
            next(error);
        }
    }
}
