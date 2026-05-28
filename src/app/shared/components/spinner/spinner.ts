import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './spinner.html'
})
export class SpinnerComponent {
  @Input() message: string = 'Chargement en cours...';
}
