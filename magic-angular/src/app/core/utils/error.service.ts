import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  constructor(private snackBar: MatSnackBar) {}

// Prends les erreurs du backend et les convertit en messages d'erreur lisibles
  getErrorMessages(error: HttpErrorResponse): string[] {
    if (error.error?.error) {
      return [error.error.error];
    }

  
    if (error.error?.message) {
      if (typeof error.error.message === 'string' && error.error.message.includes(',')) {
        return error.error.message.split(',').map((msg: string) => msg.trim());
      }
      else if (typeof error.error.message === 'string') {
        return [error.error.message];
      }
      else if (Array.isArray(error.error.message)) {
        return error.error.message;
      }
    }


    switch (error.status) {
      case 400:
        return ['Requête invalide'];
      case 401:
        return ['Identifiants non valides ou session expirée'];
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

// Montre un message d'erreur dans une snackbar
  showErrorSnackbar(error: HttpErrorResponse): void {
    const errorMessages = this.getErrorMessages(error);
    const errorMessage = errorMessages.length > 0 ? errorMessages[0] : 'Une erreur est survenue';
    
    this.snackBar.open(errorMessage, 'Fermer', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }


  applyServerErrorsToForm(form: FormGroup, error: HttpErrorResponse): void {
    const errorMessages = this.getErrorMessages(error);
    
    const errorFieldMap: Record<string, string> = {
      "Le nom de l'événement est obligatoire": 'Nom',
      "Le nom de l'événement ne peut pas dépasser 50 caractères": 'Nom',
      "La date de l'événement est obligatoire": 'Horodate',
      "La date de l'événement est invalide": 'Horodate',
      "La date de l'événement ne peut pas être dans le passé": 'Horodate',
      "L'adresse email de contact n'est pas valide": 'Email',
      "Les coordonnées de localisation sont obligatoires": 'Latitude',
      "La latitude doit être comprise entre -90 et 90": 'Latitude',
      "La longitude doit être comprise entre -180 et 180": 'Longitude',
      "L'identifiant de l'utilisateur est obligatoire": 'IdUtilisateur',
      "Le format de l'événement est obligatoire": 'IdFormat',
      "Le prix ne peut pas être négatif": 'Prix'
    };

    let hasMatchedError = false;
    
    errorMessages.forEach(message => {
      const fieldName = errorFieldMap[message];
      if (fieldName && form.get(fieldName)) {
        form.get(fieldName)?.setErrors({ serverError: message });
        hasMatchedError = true;
      }
    });

    if (!hasMatchedError && errorMessages.length > 0) {
      form.setErrors({ generalError: errorMessages.join(', ') });
    }
  }

// Récupère le message d'erreur d'un contrôle de formulaire
  getFormControlError(form: FormGroup, controlName: string): string {
    const control = form.get(controlName);
    if (!control || !control.errors) return '';
    
    if (control.errors['serverError']) {
      return control.errors['serverError'];
    }
    
    if (control.errors['required']) {
      return 'Ce champ est obligatoire';
    }
    if (control.errors['email']) {
      return 'Veuillez entrer une adresse email valide';
    }
    if (control.errors['min']) {
      return `La valeur minimale est ${control.errors['min'].min}`;
    }
    if (control.errors['max']) {
      return `La valeur maximale est ${control.errors['max'].max}`;
    }
    if (control.errors['minlength']) {
      return `Longueur minimale: ${control.errors['minlength'].requiredLength} caractères`;
    }
    if (control.errors['maxlength']) {
      return `Longueur maximale: ${control.errors['maxlength'].requiredLength} caractères`;
    }
    
    return 'Champ invalide';
  }
}