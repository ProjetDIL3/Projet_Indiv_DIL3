import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class  EmailService{
  constructor() {}


  sendEventConfirmation(event: any, email: string): Observable<boolean> {

    const emailSubject = `Confirmation - Événement "${event.Nom}" créé`;
    const emailBody = this.createEmailBody(event);
    

    console.log('========== EMAIL ==========');
    console.log(`Destinataire: ${email}`);
    console.log(`Sujet: ${emailSubject}`);
    console.log(`Contenu:\n${emailBody}`);
    console.log('====================================');


    return of(true);
  }


  private createEmailBody(event: any): string {
    const eventDateTime = new Date(event.Horodate);
    const formattedDate = eventDateTime.toLocaleDateString();
    const formattedTime = eventDateTime.toLocaleTimeString();

    return `
Votre événement "${event.Nom}" a été créé avec succès !

Détails de l'événement :
--------------------------
Date: ${formattedDate}
Heure: ${formattedTime}
Type: ${event.TypeEvenement || 'Non spécifié'}
Prix: ${event.Prix !== null && event.Prix !== undefined ? `${event.Prix} €` : 'Gratuit'}
Contact: ${event.NomContact || 'Non spécifié'}
Email: ${event.Email}

${event.Description ? `Description:\n${event.Description}\n\n` : ''}

Voir les détails complets de l'événement sur : http://localhost:4200/events/${event.IdEvenement}

Merci d'utiliser notre plateforme !
    `;
  }
}