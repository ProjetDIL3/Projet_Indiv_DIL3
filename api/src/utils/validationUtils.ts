import { User } from "../interfaces/User";
import { Event } from "../interfaces/Event";
import { isValidDate, parseDateString } from "../utils/dateUtils";


//Valide les données de connexion
export function validateLoginInput(Email: string, password: string): string[] {
    const errors: string[] = [];
    
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!Email || !emailRegex.test(Email)) {
    errors.push("L'adresse email n'est pas valide");
}

  
if (!password || password.length < 6) {
    errors.push("Le mot de passe doit contenir au moins 6 caractères");
}
  
    return errors;
}



//Valide les données d'un événement lors de la création
export function validateEventInput(event: Partial<Event>): string[] {
    const errors: string[] = [];
    
    // Valider les champs obligatoires
    if (!event.Nom || event.Nom.trim() === '') {
        errors.push("Le nom de l'événement est obligatoire");
    } else if (event.Nom.length > 50) {
        errors.push("Le nom de l'événement ne peut pas dépasser 50 caractères");
    }
    
    // Valider la date
    if (!event.Horodate) {
        errors.push("La date de l'événement est obligatoire");
    } else {
        const dateObj = new Date(event.Horodate);
        if (!isValidDate(dateObj)) {
            errors.push("La date de l'événement est invalide");
        } else if (dateObj < new Date()) {
            errors.push("La date de l'événement ne peut pas être dans le passé");
        }
    }
    
    // Valider l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!event.Email || !emailRegex.test(event.Email)) {
        errors.push("L'adresse email de contact n'est pas valide");
    }
    
    // Valider la localisation
    if (event.Latitude === undefined || event.Longitude === undefined) {
        errors.push("Les coordonnées de localisation sont obligatoires");
    } else {
        if (event.Latitude < -90 || event.Latitude > 90) {
            errors.push("La latitude doit être comprise entre -90 et 90");
        }
        if (event.Longitude < -180 || event.Longitude > 180) {
            errors.push("La longitude doit être comprise entre -180 et 180");
        }
    }
    
    // Valider les clés étrangères
    if (!event.IdUtilisateur) {
        errors.push("L'identifiant de l'utilisateur est obligatoire");
    }
    
    if (!event.IdFormat) {
        errors.push("Le format de l'événement est obligatoire");
    }
    
    if (event.Prix !== undefined && event.Prix !== null && event.Prix < 0) {
        errors.push("Le prix ne peut pas être négatif");
    }
    
    return errors;
}


//Valide les données d'un événement lors de la mise à jour
export function validateEventUpdateInput(event: Partial<Event>): string[] {
    const errors: string[] = [];
    
    if (event.Nom !== undefined) {
        if (event.Nom.trim() === '') {
            errors.push("Le nom de l'événement ne peut pas être vide");
        } else if (event.Nom.length > 50) {
            errors.push("Le nom de l'événement ne peut pas dépasser 50 caractères");
        }
    }
    
    if (event.Horodate !== undefined) {
        const dateObj = new Date(event.Horodate);
        if (!isValidDate(dateObj)) {
            errors.push("La date de l'événement est invalide");
        }
    }
    
    if (event.Email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(event.Email)) {
            errors.push("L'adresse email de contact n'est pas valide");
        }
    }
    
    if (event.Latitude !== undefined) {
        if (event.Latitude < -90 || event.Latitude > 90) {
            errors.push("La latitude doit être comprise entre -90 et 90");
        }
    }
    
    if (event.Longitude !== undefined) {
        if (event.Longitude < -180 || event.Longitude > 180) {
            errors.push("La longitude doit être comprise entre -180 et 180");
        }
    }
    
    if (event.Prix !== undefined && event.Prix !== null && event.Prix < 0) {
        errors.push("Le prix ne peut pas être négatif");
    }
    
    return errors;
}