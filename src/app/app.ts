import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PerformanceTelemetryService } from '@core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Formuloo_Compta');
  private readonly telemetry = inject(PerformanceTelemetryService);
}
