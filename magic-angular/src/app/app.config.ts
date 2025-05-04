import { ApplicationConfig } from '@angular/core';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { csrfInterceptor } from './core/interceptors/csrf.interceptor';
import { MaterialModule } from './shared/material/material.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        jwtInterceptor, 
        csrfInterceptor
      ])
    ),
    provideAnimations(),
    importProvidersFrom(MaterialModule)
  ]
};