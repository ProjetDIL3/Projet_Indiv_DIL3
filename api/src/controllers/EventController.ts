import { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/EventService';
import CustomError from '../utils/CustomError';
import { validateEventInput, validateEventUpdateInput } from '../utils/validationUtils';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';


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

            if (eventData.Image && eventData.Image.startsWith('data:image')) {
                const imageFilename = await EventController.saveImageFromBase64(eventData.Image);
                eventData.Image = imageFilename;
            }

            const validationErrors = validateEventInput(eventData);
            if (validationErrors.length > 0) {
                throw new CustomError(400, validationErrors.join(', '));
            }

            const event = await EventService.createEvent(eventData);
            if (event.Image) {
                event.Image = `${req.protocol}://${req.get('host')}/uploads/events/${event.Image}`;
            }

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

            const existingEvent = await EventService.getEventById(id);
            if (!existingEvent) {
                throw new CustomError(404, "Événement non trouvé");
            }
            // Mise à jour de l'image
            if (updates.Image === null) {
                if (existingEvent.Image && !existingEvent.Image.startsWith('http')) {
                    const oldImagePath = path.join(__dirname, '../../uploads/events', existingEvent.Image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                updates.Image = null;
            }

            if (updates.Image && updates.Image.startsWith('data:image')) {
                if (existingEvent.Image && !existingEvent.Image.startsWith('http')) {
                    const oldImagePath = path.join(__dirname, '../../uploads/events', existingEvent.Image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }

                const imageFilename = await EventController.saveImageFromBase64(updates.Image);
                updates.Image = imageFilename;
            }

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

            const existingEvent = await EventService.getEventById(id);
            if (!existingEvent) {
                throw new CustomError(404, "Événement non trouvé");
            }

            if (existingEvent.Image && !existingEvent.Image.startsWith('http')) {
                const imagePath = path.join(__dirname, '../../uploads/events', existingEvent.Image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            await EventService.deleteEvent(id);
            res.status(200).json({ message: "Événement supprimé avec succès" });
        } catch (error) {
            next(error);
        }
    }






    // Méthode  pour sauvegarder une image à partir d'une chaîne base64
    private static async saveImageFromBase64(base64Image: string): Promise<string> {
        try {
            const matches = base64Image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

            if (!matches || matches.length !== 3) {
                throw new Error('Format d\'image invalide');
            }

            const imageType = matches[1];
            const base64Data = matches[2];
            const imageBuffer = Buffer.from(base64Data, 'base64');

            let extension = 'png';
            if (imageType.includes('/')) {
                extension = imageType.split('/')[1];
            }

            const filename = `${uuidv4()}.${extension}`;
            const filePath = path.join(__dirname, '../../uploads/events', filename);

            fs.writeFileSync(filePath, imageBuffer);

            return filename;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'image:', error);
            throw new CustomError(500, 'Erreur lors de la sauvegarde de l\'image');
        }
    }

}