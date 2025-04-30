import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Ajouter le token CSRF pour les requêtes non-GET
  const csrfToken = authService.getCsrfToken();
  if (csrfToken && req.method !== 'GET') {
    req = req.clone({
      setHeaders: {
        'X-XSRF-TOKEN': csrfToken
      }
    });
  }
  
  return next(req);
};