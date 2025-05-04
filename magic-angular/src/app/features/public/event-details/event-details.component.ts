import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { MaterialModule } from '../../../shared/material/material.module';
import { MatDividerModule } from '@angular/material/divider';

import { DatePipe } from '@angular/common';
import { switchMap, catchError } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import * as L from 'leaflet';
import jsPDF from 'jspdf';

import { EventsService } from '../../../core/api/events.service';
import { MapService } from '../../../core/utils/map.service';
import { HeaderTitleService } from '../../../core/utils/header-title.service';
import { MTGEvent } from '../../../core/models/event.model';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    MatDividerModule,
    DatePipe
  ],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  event: MTGEvent | null = null;
  loading = true;
  error = false;
  address: string = '';
  private map: L.Map | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventsService: EventsService,
    private mapService: MapService,
    private headerTitleService: HeaderTitleService
  ) {
    this.fixLeafletIcons();
  }

  private fixLeafletIcons(): void {
    const iconRetinaUrl = 'leaflet/marker-icon-2x.png';
    const iconUrl = 'leaflet/marker-icon.png';
    const shadowUrl = 'leaflet/marker-shadow.png';
    
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    
    L.Marker.prototype.options.icon = iconDefault;
  }

  ngOnInit(): void {
    this.loadEventDetails();
  }

  ngAfterViewInit(): void {
    // On initialise la carte après le chargement du composant
  }

  ngOnDestroy(): void {
    this.headerTitleService.setTitle('');
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    if (this.map) {
      this.map.remove();
    }
  }

  loadEventDetails(): void {
    const sub = this.route.paramMap.pipe(
      switchMap(params => {
        const eventId = params.get('id');
        if (!eventId) {
          this.router.navigate(['/']);
          return of(null);
        }
        return this.eventsService.getEventById(eventId).pipe(
          catchError(err => {
            console.error('Erreur lors de la récupération des détails de l\'événement:', err);
            this.error = true;
            this.loading = false;
            return of(null);
          })
        );
      })
    ).subscribe(event => {
      if (!event) return;
      
      this.event = event;
      this.headerTitleService.setTitle(event.Nom);
      
      // Si l'événement n'a pas de magasin associé, on charge l'adresse
      if (!event.MagasinNom) {
        this.loadAddress();
      }
      
      this.loading = false;
      setTimeout(() => this.initMap(), 100);
    });
    
    this.subscriptions.push(sub);
  }

  loadAddress(): void {
    if (!this.event) return;
    
    const sub = this.mapService.reverseGeocode(this.event.Latitude, this.event.Longitude)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération de l\'adresse:', error);
          this.address = 'Adresse non disponible';
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) {
          this.address = this.formatAddress(result);
        } else {
          this.address = 'Adresse non disponible';
        }
      });
      
    this.subscriptions.push(sub);
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
  
  initMap(): void {
    if (!this.event) return;
    
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Conteneur de carte non trouvé');
      return;
    }
    
    // Crée la carte
    this.map = L.map('map').setView([this.event.Latitude, this.event.Longitude], 14);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    
    const marker = L.marker([this.event.Latitude, this.event.Longitude]).addTo(this.map);
    
    let popupText = `<b>${this.event.Nom}</b>`;
    
    if (this.event.MagasinNom) {
      popupText += `<br>${this.event.MagasinNom}`;
      popupText += `<br>${this.event.NumeroRue} ${this.event.Rue}, ${this.event.CP} ${this.event.Ville}`;
    } 

    else if (this.address) {
      popupText += `<br>${this.address}`;
    }
    
    marker.bindPopup(popupText).openPopup();
  }


  exportToPdf(): void {
    if (!this.event) return;
    
    // Crea il documento PDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    
    let yPosition = 20;
    const lineHeight = 10;
    
    // Funzione per aggiungere testo con ritorno a capo automatico
    const addWrappedText = (text: string, y: number, fontSize = 12): number => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, contentWidth);
      pdf.text(lines, margin, y);
      return y + (lineHeight * lines.length);
    };
    
    // Titolo dell'evento
    yPosition = addWrappedText(this.event.Nom, yPosition, 18);
    yPosition += 10;
    
    // Data e ora
    pdf.text('Date et heure:', margin, yPosition);
    pdf.text(new Date(this.event.Horodate).toLocaleString('fr-FR'), margin + 40, yPosition);
    yPosition += lineHeight;
    
    // Luogo
    pdf.text('Lieu:', margin, yPosition);

    
    if (this.event.MagasinNom) {
      pdf.text(this.event.MagasinNom, margin + 40, yPosition);
      yPosition += lineHeight;
      const addressText = `${this.event.NumeroRue || ''} ${this.event.Rue || ''}, ${this.event.CP || ''} ${this.event.Ville || ''}`.trim();
      pdf.text(addressText, margin + 40, yPosition);
      yPosition += lineHeight;
      if (this.event.MagasinTelephone) {
        pdf.text(`Téléphone: ${this.event.MagasinTelephone}`, margin + 40, yPosition);
        yPosition += lineHeight;
      }
    } else if (this.address) {
      pdf.text(this.address, margin + 40, yPosition);
      yPosition += lineHeight;
    }
    
    // Prezzo
    if (this.event.Prix !== null && this.event.Prix !== undefined) {
      pdf.text('Prix:', margin, yPosition);
      pdf.text(`${this.event.Prix} €`, margin + 40, yPosition);
      yPosition += lineHeight;
    }
    
    // Contatto
    if (this.event.NomContact) {
      pdf.text('Contact:', margin, yPosition);
      pdf.text(this.event.NomContact, margin + 40, yPosition);
      yPosition += lineHeight;
    }
    
    // Email
    pdf.text('Email:', margin, yPosition);
    pdf.text(this.event.Email, margin + 40, yPosition);
    yPosition += lineHeight;
    
    // Tipo di evento
    if (this.event.TypeEvenement) {
      pdf.text('Type d\'événement:', margin, yPosition);
      pdf.text(this.event.TypeEvenement, margin + 40, yPosition);
      yPosition += lineHeight;
    }
    
    // Formato
    if (this.event.NomFormat) {
      pdf.text('Format:', margin, yPosition);
      pdf.text(this.event.NomFormat, margin + 40, yPosition);
      yPosition += lineHeight;
    }
    
    // Linea divisoria
    yPosition += 5;
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
    
    // Descrizione
    if (this.event.Description && this.event.Description.trim() !== '') {
      pdf.text('Description', margin, yPosition);
      yPosition += 8;
      
      const descLines = pdf.splitTextToSize(this.event.Description, contentWidth);
      pdf.text(descLines, margin, yPosition);
    }
    
    // Nome del file
    const fileName = `evenement_${this.event.Nom.replace(/[^\w]/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
    
    // Salva il PDF
    pdf.save(fileName);
  }



  hasCustomImage(): boolean {
    if (!this.event) return false;
    return !!this.event.Image; 
  }

    
  getEventImage(): string {
    if (!this.event || !this.event.Image) return '';
    return this.event.Image;
  }
  
  
  getMagasinAddress(): string {
    if (!this.event) return '';
    if (!this.event.MagasinNom) return this.address;
    
    return `${this.event.NumeroRue} ${this.event.Rue}, ${this.event.CP} ${this.event.Ville}`;
  }
  
  goBack(): void {
    this.router.navigate(['/']);
  }
}