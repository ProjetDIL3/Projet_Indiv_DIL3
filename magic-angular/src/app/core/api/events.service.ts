import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Event } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}


  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }


  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }
  
// Convertir les coordonnées géographiques en adresse
  reverseGeocode(lat: number, lon: number): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    
    return this.http.get(url, {
      headers: {
        'User-Agent': 'MagicEventsApp'
      }
    }).pipe(
      catchError(error => {
        console.error('Geocoding error:', error);
        return throwError(() => new Error('Failed to get address from coordinates'));
      })
    );
  }


  // Convertir le nom de la ville en coordonnées
  geocodeCity(cityName: string, countryCode: string = 'fr'): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&country=${countryCode}&format=json&addressdetails=1&limit=5`;
    
    return this.http.get<any[]>(url, {
      headers: {
        'User-Agent': 'MagicEventsApp'
      }
    }).pipe(
      catchError(error => {
        console.error('Geocoding error:', error);
        return throwError(() => new Error('Failed to geocode city'));
      })
    );
  }
  
// Calculer la distance entre deux points géographiques
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}