import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MTGEvent } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) { }


  getAllEvents(): Observable<MTGEvent[]> {
    return this.http.get<MTGEvent[]>(this.apiUrl);
  }


  getEventById(id: string): Observable<MTGEvent> {
    return this.http.get<MTGEvent>(`${this.apiUrl}/${id}`);
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
  geocodeCity(address: string, countryCode: string = 'fr'): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1&limit=5`;

    return this.http.get<any[]>(url, {
      headers: {
        'User-Agent': 'MagicEventsApp'
      }
    }).pipe(
      catchError(error => {
        console.error('Geocoding error:', error);
        return throwError(() => new Error('Failed to geocode address'));
      })
    );
  }
}