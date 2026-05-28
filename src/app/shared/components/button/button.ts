import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'danger' | 'secondary' | 'success' | 'dark' | 'ghost' | 'ghost-danger' | 'plain';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.html',
  host: { class: 'contents' }
})
export class ButtonComponent {

  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() customClass = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() title = '';
  @Input() ariaLabel = '';

  @Output() clicked = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    if (this.customClass) {
      return this.customClass;
    }

    const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const sizes = {
      sm: 'px-3 py-2 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-sm',
      icon: 'p-2.5 text-sm'
    };

    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 focus:ring-blue-500',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm',
      dark: 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-slate-500 shadow-sm',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-500',
      'ghost-danger': 'bg-transparent hover:bg-red-50 text-slate-400 hover:text-red-600 focus:ring-red-500',
      plain: 'bg-transparent text-inherit focus:ring-slate-500'
    };

    return `${base} ${sizes[this.size]} ${this.fullWidth ? 'w-full' : ''} ${variants[this.variant]}`;
  }
}
