import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  templateUrl: './spinner.html'
})
export class SpinnerComponent {
  @Input() message: string = 'Chargement en cours...';
}