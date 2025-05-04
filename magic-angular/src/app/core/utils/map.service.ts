import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as L from 'leaflet';
import { EventsService } from '../api/events.service';
import { Shop } from '../models/shop.model';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private map: L.Map | null = null;
  private selectedMarker: L.Marker | null = null;
  private shopMarkers: L.Marker[] = [];

  constructor(private eventsService: EventsService) {
    this.fixLeafletIcons();
  }

  // Initialiser la carte
  initMap(elementId: string, center: L.LatLngExpression = [46.603354, 1.888334], zoom: number = 6): L.Map {
    const mapElement = document.getElementById(elementId);
    if (!mapElement) {
      throw new Error(`Élément DOM '${elementId}' non trouvé`);
    }

    // Créer la carte
    this.map = L.map(elementId).setView(center, zoom);

    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    return this.map;
  }

  // icônes Leaflet
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

  // Convertir l'adresse d'un magasin en coordonnées
  geocodeShopAddress(shop: Shop): Observable<L.LatLng> {
    const address = `${shop.NumeroRue} ${shop.Rue}, ${shop.CP} ${shop.Ville}, France`;
    
    return this.eventsService.geocodeCity(address).pipe(
      map(results => {
        if (results && results.length > 0) {
          const result = results[0];
          return new L.LatLng(parseFloat(result.lat), parseFloat(result.lon));
        }
        throw new Error(`Impossible de géocoder l'adresse du magasin: ${shop.Nom}`);
      }),
      catchError(error => {
        console.error(`Erreur de géocodage pour ${shop.Nom}:`, error);
        throw error;
      })
    );
  }

  // Ajouter un marqueur à une position spécifique
  addMarker(position: L.LatLngExpression, options: L.MarkerOptions = {}): L.Marker {
    if (!this.map) throw new Error('Map not initialized');
    
    const marker = L.marker(position, options);
    marker.addTo(this.map);
    return marker;
  }

  // Ajouter ou mettre à jour le marqueur sélectionné
  setSelectedMarker(position: L.LatLngExpression, popupContent?: string, draggable: boolean = true): L.Marker {
    if (!this.map) throw new Error('Map not initialized');

    // Supprimer le marqueur existant s'il y en a un
    if (this.selectedMarker) {
      this.selectedMarker.remove();
    }
    
    // Créer un nouveau marqueur
    this.selectedMarker = this.addMarker(position, { draggable });
    
    // Ajouter un popup si le contenu est fourni
    if (popupContent) {
      this.selectedMarker.bindPopup(popupContent).openPopup();
    }
    
    return this.selectedMarker;
  }

  // Obtenir l'adresse d'une position (géocodage inverse)
  reverseGeocode(position: L.LatLng): Observable<string> {
    return this.eventsService.reverseGeocode(position.lat, position.lng).pipe(
      map(result => {
        if (result && result.address) {
          return this.formatSimplifiedAddress(result);
        }
        return 'Adresse non disponible';
      }),
      catchError(error => {
        console.error('Erreur lors du géocodage inverse:', error);
        return of('Erreur de géocodage');
      })
    );
  }

  // Formater une adresse de manière simplifiée
  private formatSimplifiedAddress(nominatimResponse: any): string {
    if (!nominatimResponse || !nominatimResponse.address) {
      return 'Adresse non disponible';
    }
    
    const address = nominatimResponse.address;
    const parts = [];
    
    // Récupérer uniquement les éléments essentiels de l'adresse
    const houseNumber = address.house_number || '';
    const road = address.road || address.pedestrian || address.footway || address.path || '';
    const postcode = address.postcode || '';
    const city = address.city || address.town || address.village || address.hamlet || '';
    const country = address.country || '';
    
    // Construire l'adresse simplifiée
    if (houseNumber && road) {
      parts.push(`${houseNumber} ${road}`);
    } else if (road) {
      parts.push(road);
    }
    
    if (postcode || city) {
      parts.push(`${postcode} ${city}`.trim());
    }
    
    if (country) {
      parts.push(country);
    }
    
    return parts.join(', ');
  }

  // Nettoyer la carte
  cleanUp() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    
    this.selectedMarker = null;
    this.shopMarkers = [];
  }

  // Centrer la carte sur une position
  setView(position: L.LatLngExpression, zoom: number = 13): void {
    if (!this.map) throw new Error('Map not initialized');
    this.map.setView(position, zoom);
  }

  // Rechercher une adresse et centrer la carte dessus
  searchAddress(address: string): Observable<L.LatLng> {
    return this.eventsService.geocodeCity(address).pipe(
      map(results => {
        if (!results || results.length === 0) {
          throw new Error('Adresse non trouvée');
        }
        
        const result = results[0];
        const position = new L.LatLng(parseFloat(result.lat), parseFloat(result.lon));
        
        // Centrer la carte
        if (this.map) {
          this.setView(position);
        }
        
        return position;
      })
    );
  }
  
  // Obtenir une référence à la carte
  getMap(): L.Map | null {
    return this.map;
  }
  
  // Obtenir une référence au marqueur sélectionné
  getSelectedMarker(): L.Marker | null {
    return this.selectedMarker;
  }
}