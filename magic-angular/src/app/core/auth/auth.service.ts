import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError,catchError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthUser } from '../models/user.model';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  user: AuthUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
  
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { Email: email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.accessToken);
          localStorage.setItem('refresh_token', response.refreshToken);
          localStorage.setItem('csrf_token', response.csrfToken);
          localStorage.setItem('user_data', JSON.stringify(response.user));
        })
      );
  }
  
  refreshToken(): Observable<{accessToken: string, csrfToken: string}> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      this.clearAuthData();
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.http.post<{accessToken: string, csrfToken: string}>(
      `${environment.apiUrl}/auth/refresh`, 
      { refreshToken }
    ).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('csrf_token', response.csrfToken);
      }),
      catchError(error => {
        if (error.status === 401 || error.status === 403) {
          this.clearAuthData();
        }
        return throwError(() => error);
      })
    );
  }
  
  logout(): void {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken })
        .subscribe({
          next: () => this.clearAuthData(),
          error: () => this.clearAuthData()
        });
    } else {
      this.clearAuthData();
    }
  }
  
  getAccessToken(): string {
    return localStorage.getItem('access_token') || '';
  }
  
  getCsrfToken(): string {
    return localStorage.getItem('csrf_token') || '';
  }
  
  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }
  
  isAdmin(): boolean {
    const userData = localStorage.getItem('user_data');
    if (!userData) return false;
    
    const user = JSON.parse(userData);
    return user.RoleAdmin === true;
  }

  hasRefreshToken(): boolean {
    return !!localStorage.getItem('refresh_token');
  }
  
  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('csrf_token');
    localStorage.removeItem('user_data');
    
    this.router.navigate(['/login']);
  }
}