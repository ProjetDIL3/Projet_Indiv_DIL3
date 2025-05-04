import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Ajouter le token JWT si disponible
  const token = authService.getAccessToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
  }
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.hasRefreshToken()) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            req = req.clone({
              setHeaders: {
                Authorization: `Bearer ${authService.getAccessToken()}`,
                'X-XSRF-TOKEN': authService.getCsrfToken()
              }
            });
            return next(req);
          }),
          catchError(() => {
            authService.logout();
            return throwError(() => error);
          })
        );
      }
      
      return throwError(() => error);
    })
  );  
};