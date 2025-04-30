import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  constructor(private snackBar: MatSnackBar) {}

  /**
   * Estrae e formatta i messaggi di errore dalla risposta HTTP
   */
  getErrorMessages(error: HttpErrorResponse): string[] {
    // Se l'errore ha un messaggio strutturato
    if (error.error?.message) {
      // Se è una stringa che contiene più errori separati da virgole
      if (typeof error.error.message === 'string' && error.error.message.includes(',')) {
        return error.error.message.split(',').map((msg: string) => msg.trim());
      }
      // Se è una singola stringa
      else if (typeof error.error.message === 'string') {
        return [error.error.message];
      }
      // Se è un array
      else if (Array.isArray(error.error.message)) {
        return error.error.message;
      }
    }

    // Gestione degli errori specifici in base al codice di stato
    switch (error.status) {
      case 400:
        return ['Requête invalide'];
      case 401:
        return ['Identifiants non valides'];
      case 403:
        return ["Vous n'avez pas l'autorisation d'accéder à cette ressource"];
      case 404:
        return ['Ressource non trouvée'];
      case 500:
        return ['Erreur serveur'];
      default:
        return ['Une erreur est survenue'];
    }
  }

  /**
   * Mostra un messaggio di errore nello snackbar
   */
  showErrorSnackbar(error: HttpErrorResponse): void {
    const errorMessage = this.getErrorMessages(error)[0];
    this.snackBar.open(errorMessage, 'Fermer', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}