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


}