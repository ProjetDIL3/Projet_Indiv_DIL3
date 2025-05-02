import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Event, EventCreate } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class AdminEventsService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}


  createEvent(eventData: EventCreate): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, eventData);
  }


  updateEvent(id: string, eventData: Partial<Event>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, eventData);
  }


  deleteEvent(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }


  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }


  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }
}