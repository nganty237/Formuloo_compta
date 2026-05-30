import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal.html'
})
export class ModalComponent {

  @Input() isOpen: boolean = false;
  @Input() title: string = '';

  @Output() closed = new EventEmitter<void>();
}
