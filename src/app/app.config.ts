import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideAppLucideIcons } from './shared/icons/lucide-icons';
import { authInterceptor, tenantInterceptor, CoreModule } from '@core';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, tenantInterceptor]),
      withFetch()
    ),
    importProvidersFrom(CoreModule),
    provideClientHydration(withEventReplay()),
    provideStore(),
    provideEffects(),
    provideAppLucideIcons()
  ],
};
