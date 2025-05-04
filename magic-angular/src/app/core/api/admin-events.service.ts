import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MTGEvent, EventCreate } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class AdminEventsService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  createEvent(eventData: EventCreate): Observable<MTGEvent> {
    return this.http.post<MTGEvent>(this.apiUrl, eventData);
  }

  updateEvent(id: string, eventData: Partial<MTGEvent>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, eventData);
  }

  deleteEvent(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getAllEvents(): Observable<MTGEvent[]> {
    return this.http.get<MTGEvent[]>(this.apiUrl);
  }

  getEventById(id: string): Observable<MTGEvent> {
    return this.http.get<MTGEvent>(`${this.apiUrl}/${id}`);
  }

  // Ajout de la méthode getLocationInfo pour obtenir les informations de localisation
  getLocationInfo(lat: number, lon: number): Observable<any> {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse`;
    const params = {
      format: 'json',
      lat: lat.toString(),
      lon: lon.toString(),
      zoom: '18',
      addressdetails: '1'
    };
    
    return this.http.get(nominatimUrl, { params });
  }
}