import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Format {
  IdFormat: string;
  NomFormat: string;
  Link: string;
}

@Injectable({
  providedIn: 'root'
})
export class FormatService {
  private apiUrl = `${environment.apiUrl}/formats`;

  constructor(private http: HttpClient) { }

  getAllFormats(): Observable<Format[]> {
    return this.http.get<Format[]>(this.apiUrl);
  }

  getFormatById(id: string): Observable<Format> {
    return this.http.get<Format>(`${this.apiUrl}/${id}`);
  }
}