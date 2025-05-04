import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MaterialModule } from '../../../shared/material/material.module';
import { ShopsService } from '../../../core/api/shops.service';
import { AdminEventsService } from '../../../core/api/admin-events.service';
import { HeaderTitleService } from '../../../core/utils/header-title.service';
import { MTGEvent } from '../../../core/models/event.model';

@Component({
  selector: 'app-admin-board',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MaterialModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSortModule
  ],
  templateUrl: './admin-board.component.html',
  styleUrls: ['./admin-board.component.scss']
})
export class AdminBoardComponent implements OnInit {
  events: MTGEvent[] = [];
  displayedEvents: MTGEvent[] = [];
  loading = true;
  error = false;

  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  pageIndex = 0;
  totalEvents = 0;

  displayedColumns: string[] = ['name', 'date', 'location', 'actions'];

  addressMap: { [eventId: string]: string } = {};

  constructor(
    private adminEventsService: AdminEventsService,
    private shopsService: ShopsService,
    private router: Router,
    private headerTitleService: HeaderTitleService,
    private snackBar: MatSnackBar,
  ) { }
  // Initialisation du composant
  ngOnInit(): void {
    this.headerTitleService.setTitle('Administration des événements');
    this.fetchEvents();
  }
  // Fonction pour récupérer tous les événements
  fetchEvents(): void {
    this.loading = true;
    this.error = false;

    this.adminEventsService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.totalEvents = this.events.length;
        this.updatePage();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching events:', err);
        this.error = true;
        this.loading = false;
        this.snackBar.open('Failed to load events. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  // Fonction pour mettre à jour la page affichée
  updatePage(): void {
    const startIndex = this.pageIndex * this.pageSize;
    this.displayedEvents = this.events.slice(startIndex, startIndex + this.pageSize);
    this.loadLocationInfo();
  }
  // Fonction pour gérer le changement de page
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }
  // Fonction pour gérer le tri des événements
  sortData(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.events = [...this.events].sort((a, b) => {
      const isAsc = sort.direction === 'asc';

      switch (sort.active) {
        case 'name': return this.compare(a.Nom, b.Nom, isAsc);
        case 'date': return this.compare(new Date(a.Horodate), new Date(b.Horodate), isAsc);
        default: return 0;
      }
    });

    this.updatePage();
  }

  compare(a: any, b: any, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  // Fonction pour charger les informations de localisation des événements
  loadLocationInfo(): void {
    this.displayedEvents.forEach(event => {
      if (this.addressMap[event.IdEvenement]) {
        return;
      }

      // Si l'événement est associé à un magasin
      if (event.IdMagasin) {
        this.shopsService.getShopById(event.IdMagasin).subscribe({
          next: (shop) => {
            const shopAddress = `${shop.Nom}, ${shop.NumeroRue} ${shop.Rue}, ${shop.CP} ${shop.Ville}`;
            this.addressMap[event.IdEvenement] = shopAddress;
          },
          error: (err) => {
            console.error(`Erreur lors du chargement du magasin ${event.IdMagasin}:`, err);
            this.addressMap[event.IdEvenement] = 'Détails du magasin non disponibles';
          }
        });
      } else {
        // Sinon utiliser le géocodage inverse comme avant
        this.adminEventsService.getLocationInfo(event.Latitude, event.Longitude)
          .subscribe({
            next: (result) => {
              if (result) {
                const address = this.formatAddress(result);
                this.addressMap[event.IdEvenement] = address;
              }
            },
            error: () => {
              this.addressMap[event.IdEvenement] = 'Adresse non disponible';
            }
          });
      }
    });
  }
  // Fonction pour formater l'adresse à partir de la réponse
  formatAddress(nominatimResponse: any): string {
    if (!nominatimResponse || !nominatimResponse.address) {
      return 'Adresse non disponible';
    }

    const address = nominatimResponse.address;
    const parts = [];

    if (address.road) parts.push(address.road);
    if (address.house_number) parts.push(address.house_number);
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }
    if (address.postcode) parts.push(address.postcode);

    return parts.join(', ');
  }

  // Fonction pour ouvrir le formulaire d'événement (creation ou édition)
  openEditForm(eventId: string): void {
    this.router.navigate(['/admin/event-form', eventId]);
  }

  // Fonction pour effacer un événement
  deleteEvent(eventId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.')) {
      this.adminEventsService.deleteEvent(eventId).subscribe({
        next: () => {
          this.snackBar.open('Événement supprimé avec succès', 'Fermer', {
            duration: 3000
          });
          this.fetchEvents();
        },
        error: (err) => {
          console.error('Error deleting event:', err);
          this.snackBar.open('Erreur lors de la suppression de l\'événement', 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  retryFetch(): void {
    this.fetchEvents();
  }
}