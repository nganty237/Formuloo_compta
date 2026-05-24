import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'danger' | 'secondary';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html'
})
export class ButtonComponent {

  @Input() variant: ButtonVariant = 'primary';
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' = 'button';

  @Output() clicked = new EventEmitter<void>();

  get buttonClasses(): string {
    const base = 'px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-blue-500'
    };

    return `${base} ${variants[this.variant]}`;
  }
}