import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html'
})
export class ModalComponent {

  @Input() isOpen: boolean = false;
  @Input() title: string = '';

  @Output() closed = new EventEmitter<void>();
}