import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PerformanceTelemetryService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initTelemetry();
  }

  private initTelemetry(): void {
    // La télémétrie s'exécute uniquement côté client (dans le navigateur)
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    console.log('%c🚀 [Performance Telemetry] Service initialisé et à l\'écoute...', 'color: #10b981; font-weight: bold;');

    // 1. Observer les Long Tasks (Tâches bloquantes > 50ms sur le CPU)
    this.observeLongTasks();

    // 2. Observer le Largest Contentful Paint (LCP - Vitesse de chargement visuel principal)
    this.observeLCP();

    // 3. Observer les Layout Shifts (CLS - Stabilité visuelle)
    this.observeCLS();
  }

  private observeLongTasks(): void {
    try {
      const observer = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            console.warn(
              `%c⏳ [Telemetry] Long Task détectée ! Durée : ${entry.duration.toFixed(2)}ms (Thread principal bloqué)`,
              'color: #f59e0b; font-weight: bold;'
            );
          }
        });
      });
      observer.observe({ type: 'longtask', buffered: true });
    } catch (e) {
      console.log('[Telemetry] L\'API Long Tasks n\'est pas supportée par ce navigateur.');
    }
  }

  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log(
          `%c📊 [Telemetry] LCP mesuré : ${lastEntry.startTime.toFixed(2)}ms (Cible idéale < 2500ms)`,
          'color: #3b82f6; font-weight: bold;'
        );
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.log('[Telemetry] L\'API LCP n\'est pas supportée par ce navigateur.');
    }
  }

  private observeCLS(): void {
    let clsValue = 0;
    try {
      const observer = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            console.log(
              `%c📐 [Telemetry] Cumulative Layout Shift (CLS) mis à jour : ${clsValue.toFixed(4)} (Cible idéale < 0.1)`,
              'color: #8b5cf6;'
            );
          }
        });
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.log('[Telemetry] L\'API Layout Shift n\'est pas supportée par ce navigateur.');
    }
  }

  /**
   * Permet d'enregistrer une mesure de performance personnalisée pour une action spécifique.
   * @param markName Nom de l'action / opération
   */
  startMeasure(markName: string): void {
    if (isPlatformBrowser(this.platformId)) {
      performance.mark(`${markName}-start`);
    }
  }

  endMeasure(markName: string): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const startMark = `${markName}-start`;
        const endMark = `${markName}-end`;
        performance.mark(endMark);
        performance.measure(markName, startMark, endMark);
        
        const measure = performance.getEntriesByName(markName).pop();
        if (measure) {
          console.log(
            `%c⏱️ [Telemetry] Opération "${markName}" exécutée en : ${measure.duration.toFixed(2)}ms`,
            'color: #06b6d4; font-weight: bold;'
          );
        }
        
        // Nettoyage
        performance.clearMarks(startMark);
        performance.clearMarks(endMark);
        performance.clearMeasures(markName);
      } catch (e) {
        // Ignorer si la marque de début n'existait pas
      }
    }
  }
}
