// src/services/EventService.ts
import { pool } from '../config/dbConfig';
import { Event } from '../interfaces/Event';
import mssql from 'mssql';
import CustomError from '../utils/CustomError';
import { generateNextId } from '../utils/idUtils';
import { parseDateString, isValidDate, convertToSqlDate } from '../utils/dateUtils';

export class EventService {
    /**
     * Récupère tous les événements
     */
    static async getAllEvents(): Promise<Event[]> {
        const result = await pool.request().query(`
            SELECT * FROM Evenements
            ORDER BY Horodate ASC
        `);
        return result.recordset as Event[];
    }

    /**
     * Récupère les détails d'un événement par ID
     */
    static async getEventById(IdEvenement: string): Promise<Event | null> {
        const result = await pool.request()
            .input('IdEvenement', mssql.NChar(10), IdEvenement)
            .query(`SELECT * FROM Evenements WHERE IdEvenement = @IdEvenement`);
        if (result.recordset.length === 0) return null;
        return result.recordset[0] as Event;
    }

    /**
     * Crée un nouvel événement
     */
    static async createEvent(eventData: Partial<Event>): Promise<Event> {
        // Génère un nouvel ID
        const newId = await generateNextId('Evenements', 'IdEvenement');

        // Vérifie et convertit la date
        let horodate: string;
        if (eventData.Horodate) {
            const dateObj = new Date(eventData.Horodate);
            if (!isValidDate(dateObj)) {
                throw new CustomError(400, "Date de l'événement invalide");
            }
            horodate = convertToSqlDate(dateObj);
        } else {
            throw new CustomError(400, "La date de l'événement est obligatoire");
        }

        // Champs obligatoires
        if (!eventData.Nom || !eventData.Email || !eventData.IdUtilisateur || !eventData.IdFormat || !eventData.Latitude || !eventData.Longitude) {
            throw new CustomError(400, "Champs obligatoires manquants");
        }

        await pool.request()
            .input('IdEvenement', mssql.NChar(10), newId)
            .input('Nom', mssql.VarChar(50), eventData.Nom)
            .input('Description', mssql.VarChar(mssql.MAX), eventData.Description || null)
            .input('Horodate', mssql.DateTime, horodate)
            .input('Prix', mssql.Int, eventData.Prix ?? null)
            .input('TypeEvenement', mssql.VarChar(20), eventData.TypeEvenement || null)
            .input('Latitude', mssql.Decimal(9, 6), eventData.Latitude)
            .input('Longitude', mssql.Decimal(10, 6), eventData.Longitude)
            .input('NomContact', mssql.VarChar(50), eventData.NomContact || null)
            .input('Email', mssql.VarChar(50), eventData.Email)
            .input('Image', mssql.VarChar(mssql.MAX), eventData.Image || null)
            .input('IdUtilisateur', mssql.NChar(10), eventData.IdUtilisateur)
            .input('IdFormat', mssql.NChar(10), eventData.IdFormat)
            .input('IdMagasin', mssql.NChar(10), eventData.IdMagasin || null)
            .query(`
                INSERT INTO Evenements (
                    IdEvenement, Nom, Description, Horodate, Prix, TypeEvenement, Latitude, Longitude, NomContact, Email, Image, IdUtilisateur, IdFormat, IdMagasin
                ) VALUES (
                    @IdEvenement, @Nom, @Description, @Horodate, @Prix, @TypeEvenement, @Latitude, @Longitude, @NomContact, @Email, @Image, @IdUtilisateur, @IdFormat, @IdMagasin
                )
            `);

        return {
            IdEvenement: newId,
            Nom: eventData.Nom,
            Description: eventData.Description,
            Horodate: horodate,
            Prix: eventData.Prix,
            TypeEvenement: eventData.TypeEvenement,
            Latitude: eventData.Latitude,
            Longitude: eventData.Longitude,
            NomContact: eventData.NomContact,
            Email: eventData.Email,
            Image: eventData.Image,
            IdUtilisateur: eventData.IdUtilisateur,
            IdFormat: eventData.IdFormat,
            IdMagasin: eventData.IdMagasin
        };
    }

    /**
     * Met à jour un événement existant
     */
    static async updateEvent(id: string, updates: Partial<Event>): Promise<void> {
        // Vérifie si l'événement existe
        const existing = await this.getEventById(id);
        if (!existing) throw new CustomError(404, "Événement non trouvé");

        // Prépare la requête dynamique
        const fields = [];
        const request = pool.request().input('IdEvenement', mssql.NChar(10), id);

        if (updates.Nom !== undefined) {
            fields.push('Nom = @Nom');
            request.input('Nom', mssql.VarChar(50), updates.Nom);
        }
        if (updates.Description !== undefined) {
            fields.push('Description = @Description');
            request.input('Description', mssql.VarChar(mssql.MAX), updates.Description);
        }
        if (updates.Horodate !== undefined) {
            const dateObj = new Date(updates.Horodate);
            if (!isValidDate(dateObj)) throw new CustomError(400, "Date invalide");
            fields.push('Horodate = @Horodate');
            request.input('Horodate', mssql.DateTime, convertToSqlDate(dateObj));
        }
        if (updates.Prix !== undefined) {
            fields.push('Prix = @Prix');
            request.input('Prix', mssql.Int, updates.Prix);
        }
        if (updates.TypeEvenement !== undefined) {
            fields.push('TypeEvenement = @TypeEvenement');
            request.input('TypeEvenement', mssql.VarChar(20), updates.TypeEvenement);
        }
        if (updates.Latitude !== undefined) {
            fields.push('Latitude = @Latitude');
            request.input('Latitude', mssql.Decimal(9, 6), updates.Latitude);
        }
        if (updates.Longitude !== undefined) {
            fields.push('Longitude = @Longitude');
            request.input('Longitude', mssql.Decimal(10, 6), updates.Longitude);
        }
        if (updates.NomContact !== undefined) {
            fields.push('NomContact = @NomContact');
            request.input('NomContact', mssql.VarChar(50), updates.NomContact);
        }
        if (updates.Email !== undefined) {
            fields.push('Email = @Email');
            request.input('Email', mssql.VarChar(50), updates.Email);
        }
        if (updates.Image !== undefined) {
            fields.push('Image = @Image');
            request.input('Image', mssql.VarChar(mssql.MAX), updates.Image);
        }
        if (updates.IdUtilisateur !== undefined) {
            fields.push('IdUtilisateur = @IdUtilisateur');
            request.input('IdUtilisateur', mssql.NChar(10), updates.IdUtilisateur);
        }
        if (updates.IdFormat !== undefined) {
            fields.push('IdFormat = @IdFormat');
            request.input('IdFormat', mssql.NChar(10), updates.IdFormat);
        }
        if (updates.IdMagasin !== undefined) {
            fields.push('IdMagasin = @IdMagasin');
            request.input('IdMagasin', mssql.NChar(10), updates.IdMagasin);
        }

        if (fields.length === 0) throw new CustomError(400, "Aucune donnée à mettre à jour");

        await request.query(`
            UPDATE Evenements SET ${fields.join(', ')}
            WHERE IdEvenement = @IdEvenement
        `);
    }

    /**
     * Supprime un événement
     */
    static async deleteEvent(id: string): Promise<void> {
        const result = await pool.request()
            .input('IdEvenement', mssql.NChar(10), id)
            .query(`DELETE FROM Evenements WHERE IdEvenement = @IdEvenement`);
        if (result.rowsAffected[0] === 0) throw new CustomError(404, "Événement non trouvé");
    }
}
