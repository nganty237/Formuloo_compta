import { Component, Input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [LucideDynamicIcon],
  template: `
    <svg
      [lucideIcon]="name"
      [class]="computedClass"
      [attr.aria-hidden]="decorative ? 'true' : null"
      [attr.aria-label]="decorative ? null : label"
      [attr.role]="decorative ? null : 'img'"
    ></svg>
  `,
  host: { class: 'contents' },
})
export class IconComponent {
  @Input({ required: true }) name!: string;
  @Input() size: IconSize = 'md';
  @Input() className = '';
  @Input() decorative = true;
  @Input() label = '';

  get computedClass(): string {
    const sizes: Record<IconSize, string> = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-10 w-10',
    };

    return `${sizes[this.size]} ${this.className}`.trim();
  }
}
