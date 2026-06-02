import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideAppLucideIcons } from './shared/icons/lucide-icons';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { tenantInterceptor } from './core/interceptors/tenant-interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authInterceptor, tenantInterceptor]),
      withFetch()
    ),
    provideClientHydration(withEventReplay()),
    provideStore(),
    provideEffects(),
    provideCharts(withDefaultRegisterables()),
    provideAppLucideIcons()
  ],
};
