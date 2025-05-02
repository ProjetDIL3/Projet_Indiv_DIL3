import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { EventsService } from '../../../core/api/events.service';
import { HeaderTitleService } from '../../../core/utils/header-title.service';
import { Event } from '../../../core/models/event.model';
import { DatePipe } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatPaginatorModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDividerModule,
    DatePipe
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  loading = true;
  error = false;
  
  // Map pour memoriser les adresses des événements
  addressMap: { [eventId: string]: string } = {};

  
  pageSize = 20;
  pageSizeOptions: number[] = [5, 10, 20, 50];
  pageIndex = 0;
  totalEvents = 0;

  constructor(
    private eventsService: EventsService,
    private router: Router,
    private headerTitleService: HeaderTitleService
  ) {}

  ngOnInit(): void {
    this.headerTitleService.setTitle('ÉVENEMENTS MAGIC THE GATHERING');
    this.fetchEvents();
  }

  fetchEvents(): void {
    this.loading = true;
    this.error = false;
    
    this.eventsService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events.sort((a, b) => {
          return new Date(a.Horodate).getTime() - new Date(b.Horodate).getTime();
        });
        this.totalEvents = this.events.length;
        this.updatePage();
        this.loading = false;
        this.loadAddressesForCurrentPage();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des événements:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  updatePage(): void {
    const startIndex = this.pageIndex * this.pageSize;
    this.filteredEvents = this.events.slice(startIndex, startIndex + this.pageSize);
    this.loadAddressesForCurrentPage();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  openEventDetails(eventId: string): void {
    this.router.navigate(['/events', eventId]);
  }

  getEventImage(event: Event): string {
    if (event.Image) {
      return event.Image;
    } else {
      return '/images/eventsdefault.png';
    }
  }

  loadAddressesForCurrentPage(): void {
    this.filteredEvents.forEach(event => {
      if (this.addressMap[event.IdEvenement]) {
        return;
      }
      
      this.eventsService.reverseGeocode(event.Latitude, event.Longitude)
        .pipe(
          catchError(error => {
            console.error(`Erreur lors de la récupération de l'adresse pour l'événement ${event.IdEvenement}:`, error);
            this.addressMap[event.IdEvenement] = 'Adresse non disponible';
            return of(null);
          })
        )
        .subscribe(result => {
          if (result) {
            const address = this.formatAddress(result);
            this.addressMap[event.IdEvenement] = address;
          }
        });
    });
  }
  

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
    if (address.country) parts.push(address.country);
    
    return parts.join(', ');
  }
}