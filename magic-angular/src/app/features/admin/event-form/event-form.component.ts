import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MaterialModule } from '../../../shared/material/material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { HttpErrorResponse } from '@angular/common/http';
import * as L from 'leaflet';

import { HeaderTitleService } from '../../../core/utils/header-title.service';
import { AdminEventsService } from '../../../core/api/admin-events.service';
import { ShopsService } from '../../../core/api/shops.service';
import { MapService } from '../../../core/utils/map.service';
import { ErrorService } from '../../../core/utils/error.service';
import { FormatService } from '../../../core/api/format.service';


import { Shop } from '../../../core/models/shop.model';
import { EventCreate } from '../../../core/models/event.model';



interface Format {
  IdFormat: string;
  NomFormat: string;
  Link: string;
}

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit, AfterViewInit, OnDestroy {
  isEditMode = false;
  eventId: string | null = null;
  isLoading = false;
  formError: string | null = null;
  eventForm: FormGroup;
  imagePreview: string | null = null;
  imageFile: File | null = null;
  searchAddress: string = '';

  // Listes pour les selects
  shops: Shop[] = [];
  formats: Format[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private headerTitleService: HeaderTitleService,
    private adminEventsService: AdminEventsService,
    private shopsService: ShopsService,
    private formatService: FormatService,
    private mapService: MapService,
    public errorService: ErrorService,
    private snackBar: MatSnackBar,

  ) {
    // Initialisation du formulaire
    this.eventForm = this.fb.group({
      Nom: ['', [Validators.required, Validators.maxLength(50)]],
      Description: [''],
      eventDate: ['', Validators.required],
      eventTime: ['', Validators.required],
      Prix: [null, Validators.min(0)],
      TypeEvenement: [''],
      Latitude: [46.603354, [Validators.required, Validators.min(-90), Validators.max(90)]],
      Longitude: [1.888334, [Validators.required, Validators.min(-180), Validators.max(180)]],
      NomContact: [''],
      Email: ['', [Validators.required, Validators.email]],
      Image: [''],
      IdUtilisateur: ['', Validators.required],
      IdFormat: ['', Validators.required],
      IdMagasin: [null]
    });
  }

  ngOnInit(): void {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.eventForm.patchValue({
          IdUtilisateur: user.IdUtilisateur
        });
      } catch (e) {
        console.error('Erreur lors de la récupération des données utilisateur', e);
      }
    }

    this.route.paramMap.subscribe(params => {
      this.eventId = params.get('id');
      this.isEditMode = !!this.eventId;

      // Définir le titre approprié en fonction du mode
      if (this.isEditMode) {
        this.headerTitleService.setTitle('Modifier un événement');
        this.loadEventData();
      } else {
        this.headerTitleService.setTitle('Ajouter un événement');
      }
    });
    this.loadShops();
    this.loadFormats();
  }

  // Initialisation de la carte 
  ngAfterViewInit(): void {
    setTimeout(() => {
      const map = this.mapService.initMap('map');
      map.on('click', (e: L.LeafletMouseEvent) => {
        this.onMapClick(e.latlng);
      });

      if (this.isEditMode && 
          this.eventForm.get('Latitude')?.value && 
          this.eventForm.get('Longitude')?.value) {
        const position = new L.LatLng(
          this.eventForm.get('Latitude')?.value, 
          this.eventForm.get('Longitude')?.value
        );
        this.mapService.setView(position);
        this.mapService.setSelectedMarker(position);
      }
    }, 100);
  }


  ngOnDestroy(): void {
    this.mapService.cleanUp();
  }

  // Méthode pour charger les données de l'événement en mode édition
  loadEventData(): void {
    if (!this.eventId) return;

    this.isLoading = true;
    this.adminEventsService.getEventById(this.eventId).subscribe({
      next: (event) => {
        const eventDate = new Date(event.Horodate);
        const hours = eventDate.getHours().toString().padStart(2, '0');
        const minutes = eventDate.getMinutes().toString().padStart(2, '0');
        const eventTime = `${hours}:${minutes}`;
        
        this.eventForm.patchValue({
          Nom: event.Nom,
          Description: event.Description || '',
          eventDate: eventDate,
          eventTime: eventTime,
          Prix: event.Prix || null,
          TypeEvenement: event.TypeEvenement || '',
          Latitude: event.Latitude,
          Longitude: event.Longitude,
          NomContact: event.NomContact || '',
          Email: event.Email,
          IdUtilisateur: event.IdUtilisateur,
          IdFormat: event.IdFormat,
          IdMagasin: event.IdMagasin || null
        });
        
        if (event.Image) {
          this.imagePreview = event.Image;
        }
        
        this.isLoading = false;

        const latitude = event.Latitude;
        const longitude = event.Longitude;
        if (latitude && longitude) {
          const position = new L.LatLng(latitude, longitude);
          this.mapService.setView(position);
          this.mapService.setSelectedMarker(position);
          
          if (event.IdMagasin && event.MagasinNom) {
            const popupContent = `
              <div>
                <strong>${event.MagasinNom}</strong><br>
                <p>${event.NumeroRue || ''} ${event.Rue || ''}, ${event.CP || ''} ${event.Ville || ''}</p>
              </div>
            `;
            const marker = this.mapService.getSelectedMarker();
            if (marker) {
              marker.bindPopup(popupContent).openPopup();
            }
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorService.showErrorSnackbar(err);
      }
    });
  }

// Méthode pour charger la liste des magasins
  private loadShops(): void {
    this.isLoading = true;

    this.shopsService.getAllShops().subscribe({
      next: (shops) => {
        this.shops = shops;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorService.showErrorSnackbar(err);
      }
    });
  }

  // Méthode pour charger la liste des formats des cartes
  private loadFormats(): void {
    this.isLoading = true;

    this.formatService.getAllFormats().subscribe({
      next: (formats) => {
        this.formats = formats;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorService.showErrorSnackbar(err);
      }
    });
  }

  // Méthode appelée lors de la sélection d'un shop dans le menu déroulant
  onShopSelect(): void {
    const selectedShopId = this.eventForm.get('IdMagasin')?.value;
    if (!selectedShopId) {
      return;
    }

    const selectedShop = this.shops.find(shop => shop.IdMagasin === selectedShopId);
    if (!selectedShop) return;

    this.isLoading = true;

    // Géocoder l'adresse du magasin et mettre à jour la carte
    this.mapService.geocodeShopAddress(selectedShop).subscribe({
      next: (position) => {
        this.isLoading = false;

        // Mettre à jour les coordonnées dans le formulaire
        this.eventForm.patchValue({
          Latitude: position.lat,
          Longitude: position.lng
        });

        // Mettre à jour la carte
        this.mapService.setView(position);

        const popupContent = `
          <div>
            <strong>${selectedShop.Nom}</strong><br>
            <p>${selectedShop.NumeroRue} ${selectedShop.Rue}, ${selectedShop.CP} ${selectedShop.Ville}</p>
          </div>
        `;

        this.mapService.setSelectedMarker(position, popupContent, false);

        // Mettre à jour l'adresse dans la barre de recherche
        this.searchAddress = `${selectedShop.NumeroRue} ${selectedShop.Rue}, ${selectedShop.CP} ${selectedShop.Ville}, France`;
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(`Impossible de géocoder l'adresse du magasin`, 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  // Méthode de recherche d'adresse via la barre de recherche
  searchLocation(): void {
    if (!this.searchAddress.trim()) return;

    this.isLoading = true;

    this.mapService.searchAddress(this.searchAddress).subscribe({
      next: (position) => {
        this.isLoading = false;

        // Mettre à jour les coordonnées dans le formulaire
        this.eventForm.patchValue({
          Latitude: position.lat,
          Longitude: position.lng,
          IdMagasin: null 
        });

        // Ajouter un marqueur pour la position trouvée
        this.mapService.setSelectedMarker(position);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Adresse non trouvée. Veuillez essayer avec une autre adresse.', 'Fermer', {
          duration: 3000
        });
      }
    });
  }

  // Méthode appelée lors d'un clic sur la carte
  onMapClick(position: L.LatLng): void {
    this.eventForm.patchValue({
      Latitude: position.lat,
      Longitude: position.lng,
      IdMagasin: null 
    });

    this.mapService.setSelectedMarker(position);
    this.isLoading = true;

    this.mapService.reverseGeocode(position.lat, position.lng).subscribe({
      next: (response) => {
        this.isLoading = false;
        const address = this.mapService.formatSimplifiedAddress(response);
        this.searchAddress = address;
  
        const marker = this.mapService.getSelectedMarker();
        if (marker) {
          marker.bindPopup(`
            <div>
              <strong>Emplacement sélectionné</strong><br>
              <p>${address}</p>
            </div>
          `).openPopup();
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Erreur lors du géocodage inverse:', err);
      }
    });
  }

  // Méthode pour gérer la sélection d'image
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    this.imageFile = file;
    
    if (file.size > 5 * 1024 * 1024) {
      this.snackBar.open('L\'image ne doit pas dépasser 5MB', 'Fermer', {
        duration: 3000
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
  
  // Méthode pour supprimer l'image sélectionnée
  clearImage(): void {
    this.imagePreview = null;
    this.imageFile = null;
    this.eventForm.patchValue({
      Image: null
    });
  }

  // Préparer les données du formulaire pour l'envoi au backend
  private prepareEventData(): EventCreate {
    const formValues = this.eventForm.value;
    
    // Combiner la date et l'heure pour former Horodate
    const dateValue: Date = formValues.eventDate;
    const timeValue: string = formValues.eventTime;
    
    let horodate: Date;
    if (dateValue && timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      horodate = new Date(dateValue);
      horodate.setHours(hours, minutes, 0, 0);
    } else {
      horodate = new Date();
    }
    
    let imageData;
    if (this.imagePreview === null) {
      imageData = null;  
    } else if (this.imagePreview && this.imageFile) {
      imageData = this.imagePreview;
    } else {
      imageData = this.isEditMode ? undefined : null;
    }
    
    return {
      Nom: formValues.Nom,
      Description: formValues.Description || undefined,
      Horodate: horodate.toISOString(),
      Prix: formValues.Prix || undefined,
      TypeEvenement: formValues.TypeEvenement || undefined,
      Latitude: formValues.Latitude,
      Longitude: formValues.Longitude,
      NomContact: formValues.NomContact || undefined,
      Email: formValues.Email,
      Image: imageData,
      IdUtilisateur: formValues.IdUtilisateur,
      IdFormat: formValues.IdFormat,
      IdMagasin: formValues.IdMagasin || undefined
    };
  }

  // Méthode pour enregistrer l'événement
  saveEvent(): void {
    this.formError = null;
    if (this.eventForm.invalid) {
      this.formError = 'Veuillez corriger les erreurs dans le formulaire.';
      this.eventForm.markAllAsTouched();
      return;
    }
    
    const latitude = this.eventForm.get('Latitude')?.value;
    const longitude = this.eventForm.get('Longitude')?.value;
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      this.formError = 'Les coordonnées géographiques sont invalides.';
      return;
    }

    this.isLoading = true;
    const eventData = this.prepareEventData();

    if (this.isEditMode && this.eventId) {
      this.adminEventsService.updateEvent(this.eventId, eventData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Événement mis à jour avec succès', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/admin/dashboard']);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.errorService.applyServerErrorsToForm(this.eventForm, err);
          this.errorService.showErrorSnackbar(err);
        }
      });
    } else {
      this.adminEventsService.createEvent(eventData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Événement créé avec succès', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/admin/dashboard']);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.errorService.applyServerErrorsToForm(this.eventForm, err);
          this.errorService.showErrorSnackbar(err);
        }
      });
    }
  }

  // Méthode pour annuler et revenir à la liste des événements
  cancel(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}