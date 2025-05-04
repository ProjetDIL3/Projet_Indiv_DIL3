import { pool } from '../config/dbConfig';
import { generateNextId } from '../utils/idUtils';
import { convertToSqlDateTime } from '../utils/dateUtils';
import mssql from 'mssql';
import { Event } from '../interfaces/Event';
import { EventService } from '../services/EventService';

async function generateEvents(count: number = 10): Promise<void> {
    console.log(`Démarrage de la génération de ${count} événements...`);
    
    // Types d'événements
    const eventTypes = ['Tournament', 'Pre-release', 'Draft', 'Standard', 'Modern', 'Commander', 'Legacy'];
    
    // IDs de format comme spécifié
    const formatIds = ['for0000000', 'for0000001', 'for0000002', 'for0000003', 'for0000004', 'for0000005'];
    
    // Modèles de noms d'événements
    const eventNames = [
        'Magic Tournament',
        'Friday Night Magic',
        'Commander Night',
        'Standard Showdown',
        'Modern Masters',
        'Legacy Challenge',
        'Draft Weekend',
        'Pre-release Party',
        'Pioneer Championship',
        'MTG Arena Challenge'
    ];
    
    // Descriptions d'événements
    const descriptions = [
        'Rejoignez-nous pour un événement Magic: The Gathering passionnant !',
        'Testez votre deck contre d\'autres joueurs dans ce tournoi compétitif.',
        'Environnement de jeu décontracté pour tous niveaux de compétence.',
        'Prix pour les meilleurs joueurs !',
        'Apportez votre meilleur deck et concourez pour des boosters.',
        'Nouveaux joueurs bienvenus ! Apprenez à jouer à Magic avec nous.',
        'Événement spécial avec règles et prix uniques.',
        'Jouez avec le nouveau set avant sa sortie officielle !',
        'Rondes suisses suivies des playoffs du top 8.',
        null
    ];
    
    // ID utilisateur fixe comme demandé
    const userId = 'uti0000001';
    
    for (let i = 0; i < count; i++) {
        try {
            // Date aléatoire entre maintenant et 1 an dans le futur
            const currentDate = new Date();
            const futureDate = new Date();
            futureDate.setFullYear(currentDate.getFullYear() + 1);
            const randomDate = new Date(
                currentDate.getTime() + Math.random() * (futureDate.getTime() - currentDate.getTime())
            );
            
            // Génération de coordonnées en France
            const latitude = 48.8566 + (Math.random() * 0.02 - 0.01); 
            const longitude = 2.3522 + (Math.random() * 0.02 - 0.01); 
            
            // Prix aléatoire entre 0 et 10, parfois null
            const price = Math.random() > 0.2 ? Math.floor(Math.random() * 10) : null;
            
            // Sélection d'éléments aléatoires
            const eventName = `${eventNames[Math.floor(Math.random() * eventNames.length)]} #${Math.floor(Math.random() * 100)}`;
            const description = descriptions[Math.floor(Math.random() * descriptions.length)];
            const eventType = Math.random() > 0.2 ? eventTypes[Math.floor(Math.random() * eventTypes.length)] : undefined;
            const formatId = formatIds[Math.floor(Math.random() * formatIds.length)];
            
            // Données de l'événement en utilisant l'interface Event
            const eventData: Partial<Event> = {
                Nom: eventName,
                Description: description || undefined,
                Horodate: randomDate.toISOString(),
                Prix: price !== null ? price : undefined,
                TypeEvenement: eventType,
                Latitude: parseFloat(latitude.toFixed(6)),
                Longitude: parseFloat(longitude.toFixed(6)),
                NomContact: undefined,
                Email: 'contact@magicevent.com',
                Image: undefined,
                IdUtilisateur: userId,
                IdFormat: formatId,
                IdMagasin: undefined
            };
            
            // Utilisation du service pour créer l'événement
            const createdEvent = await EventService.createEvent(eventData);
            
            console.log(`Événement ${i + 1}/${count} généré: ${createdEvent.IdEvenement}`);
        } catch (error) {
            console.error(`Erreur lors de la génération de l'événement ${i + 1}:`, error);
        }
    }
    
    console.log('Génération d\'événements terminée !');
}

export { generateEvents };